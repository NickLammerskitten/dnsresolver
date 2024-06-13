import axios from "axios";
import {CsvCreator} from "./CsvCreator.tsx";
import {resultProps} from "../interfaces/ResultProps.tsx";
import {CsvDownloader} from "./CsvDownloader.tsx";
import {CsvFileInput} from "./CsvFileInput.tsx";
import {ImpervaExportProps} from "../interfaces/ImpervaExportProps.tsx";
import React from "react";

interface apiResponse {
    "status": string,
    "hostname": string,
    "records": {
        "A": string[],
        "CNAME": string[],
        "MX": string[],
        "NS": nsRecord[],
        "SOA": string[],
        "TXT": string[],
    }
}

interface nsRecord {
    nameserver: string,
}

export function DnsResolver() {
    const [domains, setDomains] = React.useState<ImpervaExportProps[]>([])
    const [results, setResults] = React.useState<resultProps[]>([])
    const [csvResult, setCsvResult] = React.useState("");

    const resolveDomains = async () => {
        setResults([]);

        const responses = await Promise.all(domains.map(async domain => {
            return await axios.get('https://networkcalc.com/api/dns/lookup/' + domain.domainName)
                .then((response) => {
                    const data: apiResponse = response.data;
                    return mapApiResponse(data, domain.value);
                });
        }));

        setResults(responses);
    }

    React.useEffect(() => {
        if (results) {
            setCsvResultHandler();
        }
    }, [results])

    const mapApiResponse = (data: apiResponse, newValue: string): resultProps => {
        const nameserverValues: string[] = data.records.NS.map((nameserver) => {
            return nameserver.nameserver;
        })

        return {
            domainName: data.hostname,
            nameserver: nameserverValues,
            newTxtRecord: newValue
        }
    }

    const setCsvResultHandler = () => {
        const csv = CsvCreator(results);
        console.log(csv);
        setCsvResult(csv);
    }

    return (
        <div className={"card"}>

            <div className={"flex"}>
                <CsvFileInput domains={domains} handleDomainsChange={setDomains}/>
            </div>

            <ul>
                {domains.map(domain => (
                    <li key={domain.domainName}>{domain.domainName} | {domain.value}</li>
                ))}
            </ul>

            <div className={"flex mb-1"}>
                <button onClick={resolveDomains} className={"mr-1"}>Resolve domains</button>

                {csvResult.length > 0 &&
                    <button onClick={() => CsvDownloader(csvResult, "dnsResults.csv")}>
                        Download as CSV
                    </button>
                }
            </div>

            <table>
                <tbody>
                <tr>
                    <th style={{
                        width: "10rem"
                    }}>
                        Domain
                    </th>
                    <th style={{
                        width: "20rem"
                    }}>Nameserver
                    </th>
                    <th>TxtRecords</th>
                </tr>
                {results.map((resultProps, i) => {
                    const nameserver = resultProps.nameserver;
                    return (
                        <tr key={i} style={{
                            verticalAlign: "top"
                        }}>
                            <td key={resultProps.domainName}>{resultProps.domainName}</td>
                            <td key={resultProps.domainName + "ns"}>
                                {nameserver.map((nameserverValue, index) => {
                                    const isLast = nameserver[nameserver.length - 1] === nameserverValue;
                                    return (
                                        <div key={index} style={{
                                            display: 'inline-block'
                                        }}>{isLast ? nameserverValue : `${nameserverValue}, `}</div>
                                    )
                                })}
                            </td>
                            <td key={resultProps.domainName + "txt"}>
                                {resultProps.newTxtRecord}
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}