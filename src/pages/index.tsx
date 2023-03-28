import Head from 'next/head'
import React from "react"
import * as xlsx from 'xlsx'

import { parseJSON } from '@/utils/parse-json'
import { Data, ExcelKeys, XMLS } from '@/types'
import { CreateXMLResponse } from './api/create-xml'

export default function Home() {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [data, setData] = React.useState<Data>({
    rfc: "",
    month: "",
    year: "",
  })
  const [xmls, setXMLS] = React.useState<XMLS>()
  const [file, setFile] = React.useState<File>()
  const [password, setPassword] = React.useState<string>("")
  const [isLogged, setIsLogged] = React.useState<boolean>(false)

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    return setData(() => ({ ...data, [name]: value }))
  }

  const onChangeInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files) {
      const file = e.target.files[0]
      setFile(() => file)
    }
  }

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(() => true)

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    
    const parsedResponse = await response.json();
    setIsLogged(() => parsedResponse.response.valid)
    setLoading(() => false)
  }

  const onCreateFile = async (filename: string, data: string, type: "catalog" | "balance") => {
    const response = await fetch("/api/create-xml", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename, data }),
    });
    const parsedData: CreateXMLResponse = await response.json();

    if (type === "catalog") {
      return setXMLS((prevState) => ({ balance: String(prevState?.balance), catalog: parsedData.response.url }))
    }

    return setXMLS((prevState) => ({ balance: parsedData.response.url, catalog: String(prevState?.catalog) }))
  }

  const readUploadFile = () => {
    const reader = new FileReader();
    reader.onload = async (e) => {
        setLoading(() => true)
        const information = e.target?.result;
        const workbook = xlsx.read(information, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: ExcelKeys[] = xlsx.utils.sheet_to_json(worksheet, {
          skipHidden: true,
          defval: 0.00,
          header: ["accountNumber", "description", "initialBalance", "balanceDue", "haveBalance", "finalBalance", "bundlerCode"],
        });
        const parsedXMLS = parseJSON(json, true, true, data)

        await onCreateFile(`${data.rfc}${data.year}${data.month}CT.xml`, parsedXMLS.catalog, "catalog")
        await onCreateFile(`${data.rfc}${data.year}${data.month}BN.xml`, parsedXMLS.balance, "balance")

        setLoading(() => false)
    };
    reader.readAsArrayBuffer(file as Blob);
  }

  const onBeforeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    readUploadFile()
  }

  const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    return setXMLS(undefined)
  }

  return (
    <>
      <Head>
        <title>Generador de XML para contabilidad eléctronica (SAT)</title>
        <meta name="description" content="Generador de XML para contabilidad eléctronica (SAT)" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        {isLogged ? (
          <div className="container max-w-screen-md mx-auto px-2 py-4">
            <form onSubmit={onBeforeSubmit} className="flex flex-col items-center justify-center h-screen gap-5">
              <h1 className="text-xl text-center font-medium py-6">
                Generador de XML para contabilidad eléctronica (SAT)
              </h1>
              <div className="flex flex-col w-full gap-2">
                <label htmlFor="rfc">RFC:</label>
                <input
                  type="text"
                  name="rfc"
                  id="rfc"
                  className="rounded border-2 px-2 py-2 text-sm h-auto"
                  autoComplete="off"
                  value={data.rfc}
                  onChange={onChangeInput}
                  required
                />
              </div>
              <div className="flex flex-col w-full gap-2">
                <label htmlFor="month">Mes:</label>
                <input
                  type="number"
                  name="month"
                  id="month"
                  className="rounded border-2 px-2 py-2 text-sm h-auto"
                  autoComplete="off"
                  maxLength={2}
                  minLength={2}
                  value={data.month}
                  onChange={onChangeInput}
                  required
                />
              </div>
              <div className="flex flex-col w-full gap-2">
                <label htmlFor="year">Año:</label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  className="rounded border-2 px-2 py-2 text-sm h-auto"
                  autoComplete="off"
                  maxLength={4}
                  minLength={4}
                  value={data.year}
                  onChange={onChangeInput}
                  required
                />
              </div>
              <div className="flex flex-col w-full gap-2">
                <label htmlFor="upload">Seleccione el archivo de excel:</label>
                <input
                  type="file"
                  name="upload"
                  id="upload"
                  className="block w-full text-sm text-sky-900
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-sky-200 file:text-sky-900
                  hover:file:bg-sky-300
                "
                  onChange={onChangeInputFile}
                  required
                />
              </div>

              {(xmls?.balance || xmls?.catalog) && (
                <div className="flex flex-row w-full gap-4">
                  <a href={xmls.balance} target="_blank" rel="noreferrer" className="rounded p-3 bg-green-700 text-white text-center w-full">
                    Descargar balanza
                  </a>
                  <a href={xmls.catalog} target="_blank" rel="noreferrer" className="rounded p-3 bg-green-700 text-white text-center w-full">
                      Descargar catalogo
                  </a>
                </div>
              )}

              <div className="flex flex-row w-full my-2">
                {xmls?.balance || xmls?.catalog ? (
                  <button
                    className="rounded p-3 bg-sky-700 text-white text-center w-full disabled:opacity-75"
                    disabled={loading}
                    onClick={onReset}
                  >
                    Reiniciar
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="rounded p-3 bg-sky-700 text-white text-center w-full disabled:opacity-75"
                    disabled={loading}
                  >
                    Generar XMLs
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="container max-w-screen-md mx-auto px-2 py-4">
            <form onSubmit={onLogin} className="flex flex-col items-center justify-center h-screen gap-5">
              <h1 className="text-xl text-center font-medium py-6">
                Ingresar al generador de XML para contabilidad eléctronica (SAT)
              </h1>
              <div className="flex flex-col w-full gap-2">
                <label htmlFor="password">Contraseña:</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="rounded border-2 px-2 py-2 text-sm h-auto"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-row w-full my-2">
                <button
                  type="submit"
                  className="rounded p-3 bg-sky-700 text-white text-center w-full disabled:opacity-75"
                  disabled={loading}
                >
                  Acceder
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </>
  )
}
