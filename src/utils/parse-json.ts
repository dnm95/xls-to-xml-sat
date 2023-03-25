import { Data, ExcelKeys, XMLS } from "@/types"

export function parseJSON(json: ExcelKeys[], catalog: boolean, balance: boolean, data: Data) {
  let catalogXML = ""
  let balanceXML = ""

  if (catalog) {
    catalogXML = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
    <catalogocuentas:Catalogo xmlns:catalogocuentas="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas/CatalogoCuentas_1_3.xsd" Version="1.3" RFC="${data.rfc}" Mes="${data.month}" Anio="${data.year}">\n`
    json.forEach((obj: ExcelKeys) => {
      catalogXML = catalogXML + `<catalogocuentas:Ctas CodAgrup="${obj.bundlerCode}" NumCta="${obj.accountNumber}" Desc="${obj.description}" />\n`
    })

    catalogXML = catalogXML + `</catalogocuentas:Catalogo>`
  }

  if (balance) {
    balanceXML = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
    <BCE:Balanza xmlns:BCE="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/BalanzaComprobacion" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/BalanzaComprobacion http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/BalanzaComprobacion/BalanzaComprobacion_1_3.xsd" Version="1.3" RFC="${data.rfc}" TipoEnvio="N" Mes="${data.month}" Anio="${data.year}">\n`
    json.forEach((obj: ExcelKeys) => {
      if (obj.balanceDue > 0 || obj.initialBalance > 0 || obj.finalBalance > 0 || obj.haveBalance  > 0) {
        balanceXML = balanceXML + `<BCE:Ctas NumCta="${obj.accountNumber}" SaldoIni="${obj.initialBalance.toFixed(2)}" Debe="${obj.balanceDue.toFixed(2)}" Haber="${obj.haveBalance.toFixed(2)}" SaldoFin="${obj.finalBalance.toFixed(2)}" />\n`
      }
    })
    balanceXML = balanceXML + `</BCE:Balanza>`
  }

  return { catalog: catalogXML, balance: balanceXML } as XMLS
}