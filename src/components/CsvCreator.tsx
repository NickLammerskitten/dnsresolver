import {resultProps} from "../interfaces/ResultProps.tsx";

export function CsvCreator (data: resultProps[]) {
    if (data.length === 0) return "";
    const titleKey = Object.keys(data[0])

    const refinedData = [];
    refinedData.push(titleKey);

    data.forEach((item:resultProps) => {
        refinedData.push(Object.values(item));
    })

    let csvContent = "";
    refinedData.forEach(row => {
        csvContent += row.join(";") + "\n";
    })

    return csvContent;
}