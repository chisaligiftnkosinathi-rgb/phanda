# API Conventions (v1.0.0)

## Rest API Resource Modeling
Resources in the Phanda OS ecosystem (iPhande, Phanda, AXIONYX, iSebenza) must clearly demarcate execution routes from governance routes.

### Execution Routes (World A)
- `POST /api/v1/opportunities`
- Execution routes are imperative.

### Observation Routes (World C)
- `GET /api/v1/insights/opportunities`
- Cannot trigger execution.

### Arbitration Routes (World F)
- `POST /api/v1/arbitration/decisions`
- Surfaces halt states and accepts human decisions.

## Identity Header
Every request across the portfolio must carry the single Portfolio Identity token issued by iPhande.
- `Authorization: Bearer <iPhande_JWT>`
