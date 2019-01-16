import { GoogleSheet, ServiceAccount } from 'google-sheets-manager';
import * as creds from './credentials.json';
export const serverPort = process.env.PORT || 8000;
export const logFormat = 'dev';
export const backendURL = `http://localhost:${serverPort}/`;

const spreadsheetID = '1HgFqak5AUZBnSCHBkKvKiGsHw8TEq7MVLWdW5SP6Eks';
const mainSheetID = 1128497297;
const colorKeySheetID = 539679140;
const attributeSheetID = 1037601079;

export const authClass = new ServiceAccount(creds);
export const sheetsAPI = new GoogleSheet(authClass, spreadsheetID, mainSheetID);

export const defaultCallbackForAPI = (err: any, res: any) => {
    if (err) {
        console.log(`ERROR -- ${err}`);
        throw err;
    }
    console.log(res);
};

export const pageTwoSheetsAPI = new GoogleSheet(authClass, spreadsheetID, colorKeySheetID);
export const attributeSheetsAPI = new GoogleSheet(authClass, spreadsheetID, attributeSheetID);

export const subjectStart = 'Library book searching bot: ';
