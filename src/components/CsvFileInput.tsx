import React from "react";
import Papa from "papaparse";
import {ImpervaExportProps} from "../interfaces/ImpervaExportProps.tsx";

interface CsvFileInputProps {
    domains: ImpervaExportProps[];
    handleDomainsChange: (domains: ImpervaExportProps[]) => void;
}

export function CsvFileInput({domains, handleDomainsChange}: CsvFileInputProps) {
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

    const handleFileChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        const files  = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    }

    const handleFileRead = () => {
        if (selectedFile) {
            Papa.parse(selectedFile, {
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    handleParse(results.data);
                }
            })
        }
    }

    const handleParse = (data: any) => {
        const convertedData: ImpervaExportProps[] = [];
        data.forEach((dataElement: any) => {
            const domainName = dataElement["Domain name"];
            const value = dataElement["Value"];

            if (!(domainName && value)) {
                return;
            }

            convertedData.push({
                domainName: domainName,
                value: value
            })
        })

        handleDomainsChange(convertedData);
    }

    React.useEffect(() => {
        console.log(domains);
    }, [domains]);

    return (
        <>
            <input type={"file"} accept={".csv"} onChange={handleFileChange}/>
            <button onClick={handleFileRead}>Read CSV</button>
        </>
    )
}