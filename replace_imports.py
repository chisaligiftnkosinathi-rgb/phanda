import os
import re

count = 0
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            # Careful not to replace '@supabase/supabase-js' imports
            new_content = re.sub(r"from\s+['\"](?!\@supabase/supabase-js).*?supabase['\"]", "from '@/lib/supabase/client'", content)
            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {filepath}')
                count += 1
print(f'Replaced in {count} files.')
