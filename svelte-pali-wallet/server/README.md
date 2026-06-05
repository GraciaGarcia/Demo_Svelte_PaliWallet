# Backend para Transacciones del Contrato

Guarda las transacciones del contrato en PostgreSQL.

## Instalación

```bash
npm install
```

## Iniciar

```bash
npm start
```

El servidor corre en `http://localhost:3001`

## Verificar en BD

```sql
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
```
