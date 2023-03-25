import Head from 'next/head'
import dynamic from 'next/dynamic'
import React from "react"
import * as xlsx from 'xlsx'

import { parseJSON } from '@/utils/parse-json'
import { Data, ExcelKeys, XMLS } from '@/types'

import "@uiw/react-textarea-code-editor/dist.css";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: false }
);

export default function Home() {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [data, setData] = React.useState<Data>({
    rfc: "",
    month: "",
    year: "",
  })
  const [xmls, setXMLS] = React.useState<XMLS>()
  const [file, setFile] = React.useState<File>()

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

  const readUploadFile = () => {
    const reader = new FileReader();
    reader.onload = (e) => {
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
        setXMLS(parsedXMLS)
    };
    reader.readAsArrayBuffer(file as Blob);
  }

  const onBeforeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(() => true)

    await readUploadFile()

    setLoading(() => false)
  }

  return (
    <>
      <Head>
        <title>Generador de XML para contabilidad eléctronica (SAT)</title>
        <meta name="description" content="Generador de XML para contabilidad eléctronica (SAT)" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className="container max-w-screen-md mx-auto px-4">
          <h1 className="text-xl text-center font-medium py-6">
            Generador de XML para contabilidad eléctronica (SAT)
          </h1>
          <form onSubmit={onBeforeSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="rfc">RFC:</label>
              <input
                type="text"
                name="rfc"
                id="rfc"
                className="rounded border-2 px-2 py-2 text-sm h-auto"
                autoComplete="off"
                value={data.rfc}
                onChange={onChangeInput}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="month">Mes:</label>
              <input
                type="number"
                name="month"
                id="month"
                className="rounded border-2 px-2 py-2 text-sm h-auto"
                autoComplete="off"
                maxLength={2}
                value={data.month}
                onChange={onChangeInput}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="year">Año:</label>
              <input
                type="number"
                name="year"
                id="year"
                className="rounded border-2 px-2 py-2 text-sm h-auto"
                autoComplete="off"
                maxLength={4}
                value={data.year}
                onChange={onChangeInput}
              />
            </div>
            <div className="flex flex-col gap-2">
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
              />
            </div>
            <div className="flex flex-row my-2">
              <button
                type="submit"
                className="rounded p-3 bg-sky-700 text-white text-center w-full"
                disabled={loading}
              >
                Generar XMLs
              </button>
            </div>
          </form>
        </div>

        <div className="container max-w-screen-xl mx-auto px-4 my-8">
          <div className="flex flex-row gap-2" style={{ maxHeight: "500px" }}>
            {xmls?.catalog && (
              <CodeEditor
                value={xmls?.catalog}
                language="xml"
                padding={15}
                style={{ overflowY: "auto" }}
              />
            )}
            {xmls?.balance && (
              <CodeEditor
                value={xmls?.balance}
                language="xml"
                padding={15}
                style={{ overflowY: "auto" }}
              />
            )}
          </div>
        </div>
      </main>
    </>
  )
}
