import os
import sys
import re

def check_feature_structure(features_dir):
    errors = []
    # Engine modules to check strictly
    engine_modules = ['opportunity', 'lead', 'quote', 'work', 'reflection', 'invoice', 'business', 'dashboard']
    
    for module_name in os.listdir(features_dir):
        if module_name not in engine_modules:
            continue
            
        module_path = os.path.join(features_dir, module_name)
        if not os.path.isdir(module_path):
            continue
            
        # Check required index.ts barrel
        index_file = os.path.join(module_path, "index.ts")
        if not os.path.exists(index_file):
            errors.append(f"Module '{module_name}' is missing 'index.ts' barrel file")

        # Check types, hooks (can be directories or files)
        for req in ["types", "hooks"]:
            req_dir = os.path.join(module_path, req)
            req_file = os.path.join(module_path, f"{req}.ts")
            req_tsx = os.path.join(module_path, f"{req}.tsx")
            if not (os.path.exists(req_dir) or os.path.exists(req_file) or os.path.exists(req_tsx)):
                errors.append(f"Module '{module_name}' is missing '{req}' (directory or file)")

        # Mappers check
        # Some modules like dashboard, quote, lead, opportunity must have mappers
        mappers_dir = os.path.join(module_path, "mappers")
        if module_name in ['quote', 'lead', 'opportunity', 'dashboard']:
            if not os.path.exists(mappers_dir):
                errors.append(f"Module '{module_name}' is missing 'mappers' directory")
            else:
                mapper_file = os.path.join(mappers_dir, f"{module_name}Mapper.ts")
                if not os.path.exists(mapper_file):
                    errors.append(f"Module '{module_name}' is missing '{module_name}Mapper.ts'")
                    
    return errors

def check_screens(app_dir):
    errors = []
    # Find all screen files in app/ recursively
    screen_files = []
    for root, _, files in os.walk(app_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                screen_files.append(os.path.join(root, file))
                
    for filepath in screen_files:
        # Skip developer screen diagnostics and legacy/uncompleted features
        # (Work engine, Reflection engine, legacy billing/payment screens)
        skip_patterns = [
            r"developer\.tsx",
            r"onboarding[\\/]hub\.tsx",
            r"payment-verification\.tsx",
            r"upgrade\.tsx",
            r"reality-capture\.tsx",
            r"jobs[\\/]",
            r"tabs[\\/]timeline\.tsx",
            r"tools[\\/]",
            r"work[\\/]"
        ]
        if any(re.search(pat, filepath, re.IGNORECASE) for pat in skip_patterns):
            continue
            
        rel_path = os.path.relpath(filepath, app_dir)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # 1. No generated DTO / API imports
            if "generated/api" in content or "generated/models" in content:
                errors.append(f"Screen '{rel_path}' imports directly from generated API/models (DTO leakage)")
                
            # 2. No fetch() or fetchWithAuth() calls
            # Use regex to find call patterns
            if re.search(r'\bfetch\s*\(', content):
                errors.append(f"Screen '{rel_path}' contains direct 'fetch()' calls")
            if re.search(r'\bfetchWithAuth\s*\(', content):
                errors.append(f"Screen '{rel_path}' contains direct 'fetchWithAuth()' calls")
                
            # 3. Screens only import from feature barrels, no deep paths
            # e.g., import ... from '@/features/quote/hooks/useQuote' -> violation
            # Allow import ... from '@/features/quote' or '@/features/quote/'
            deep_imports = re.findall(r'from\s+[\'"]@/features/([^/\'"]+)/([^\'"]+)[\'"]', content)
            for module, subpath in deep_imports:
                # Subpath shouldn't be deeper than index file, but wait,
                # are there exceptions? Screens shouldn't deep import hooks, mappers, types.
                # If subpath is not empty and not "index", it's a violation
                if subpath and subpath != "index":
                    errors.append(f"Screen '{rel_path}' deep imports from features: '@/features/{module}/{subpath}' (should import from barrel)")
                    
    return errors

def check_mappers(features_dir):
    errors = []
    for module_name in os.listdir(features_dir):
        module_path = os.path.join(features_dir, module_name)
        mappers_dir = os.path.join(module_path, "mappers")
        if not os.path.exists(mappers_dir):
            continue
            
        for file in os.listdir(mappers_dir):
            if not file.endswith('.ts'):
                continue
            filepath = os.path.join(mappers_dir, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Find all imported DTO names
                # e.g., import { Quote, QuoteCreate } from '@/generated/models';
                # We extract the names in curly braces
                dto_imports = re.findall(r'import\s+\{\s*([^}]+)\s*\}\s+from\s+[\'"]@/generated/(?:models|api)[\'"]', content)
                dtos = []
                for imp in dto_imports:
                    dtos.extend([x.strip() for x in imp.split(',') if x.strip()])
                    
                if not dtos:
                    continue
                    
                # Look for functions returning any of these DTOs
                # Matches: : DTOName or : Promise<DTOName>
                for dto in dtos:
                    # Avoid matching inside words
                    pattern = rf':\s*(?:Promise<)?\b{dto}\b'
                    if re.search(pattern, content):
                        errors.append(f"Mapper '{module_name}/{file}' returns DTO '{dto}' directly (violates domain boundary)")
                        
    return errors

def check_mutations(features_dir):
    errors = []
    for module_name in os.listdir(features_dir):
        module_path = os.path.join(features_dir, module_name)
        hooks_dir = os.path.join(module_path, "hooks")
        if not os.path.exists(hooks_dir):
            # Check hooks.ts
            hooks_file = os.path.join(module_path, "hooks.ts")
            if os.path.exists(hooks_file):
                files_to_check = [hooks_file]
            else:
                continue
        else:
            files_to_check = [os.path.join(hooks_dir, f) for f in os.listdir(hooks_dir) if f.endswith(('.ts', '.tsx'))]
            
        for filepath in files_to_check:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # If useMutation is present, check that it contains invalidateQueries
                # This is a basic safety check
                if "useMutation" in content:
                    # Should contain invalidateQueries
                    if "invalidateQueries" not in content:
                        rel_path = os.path.relpath(filepath, features_dir)
                        errors.append(f"Hook file '{rel_path}' contains useMutation but does not call invalidateQueries")
                        
    return errors

def main():
    features_dir = os.path.join("src", "features")
    app_dir = "app"
    
    errors = []
    
    print("Running Architecture Audits...")
    errors.extend(check_feature_structure(features_dir))
    errors.extend(check_screens(app_dir))
    errors.extend(check_mappers(features_dir))
    errors.extend(check_mutations(features_dir))
    
    if errors:
        print("\nArchitecture Audit FAILED:")
        for err in errors:
            print(" -", err)
        sys.exit(1)
    else:
        print("\nArchitecture Audit PASSED.")
        sys.exit(0)

if __name__ == "__main__":
    main()
