# Infra Optimisation Pipeline

Pipeline LangGraph en 3 noeuds : lit des logs d'infrastructure JSON, detecte les anomalies par seuils et genere un rapport JSON de recommandations.

## Lancer

```bash
npm install
npm run generate
```

Equivalent manuel :

```bash
npm run build
npm start
```

Lit `input_logs.json`, ecrit `output.json`.

## Architecture

```text
src/
  types.ts                  # interfaces partagees entre noeuds
  config.ts                 # seuils d'anomalie et mapping recommandations
  nodes/
    ingestion.ts            # Node 1 : charge + valide les logs
    analysis.ts             # Node 2 : insights + detection d'anomalies
    recommendation.ts       # Node 3 : anomalie -> action concrete
  pipeline.ts               # orchestration LangGraph : branche les 3 noeuds
```

`pipeline.ts` utilise `StateGraph` de LangGraph pour expliciter la succession `ingestion -> analysis -> recommendation`.