# Fixtures de upload (opcional)

Los tests usan archivos mínimos generados en código. Si quieres probar con exports reales, colócalos aquí:

| Plataforma | Ruta | Formato |
|------------|------|---------|
| `mercadolibre` | `mercadolibre/sample.xlsx` | XLSX |
| `amazon` | `amazon/sample.csv` | CSV |
| `amazon_reserva` | `amazon_reserva/sample.csv` | CSV |
| `spakio` | `spakio/sample.csv` | CSV |

Si el archivo existe, el test lo usa; si no, usa el fixture sintético.

No subas datos sensibles al repo.
