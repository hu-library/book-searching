import { SearchStatus } from './searchStatus.enum';
import { ItemType } from './itemType.type';
import { Patron } from './patron.model';
import { ElectronicCopy } from './electronicCopy.type';
import { Urgency } from './urgency.type';
import * as fromPatron from './fromPatron';
import * as fromVoyager from './fromVoyager';
import { columns } from './columns';
import { SearchLocation, parseLocation } from './searchLocations.type';

export class Book {
    private listedOnReserve: boolean;
    private markedLostBelievedReturned: boolean;
    private placeHold: boolean;
    private recommendedByProfessor: boolean;
    private recommendReplacement: boolean;
    private requestedButNotRequired: boolean;
    private requiredForClass: boolean;
    private requiredForSeminar: boolean;
    private timestamp: Date;
    private dateNoLongerNeeded: Date;
    private electronicCopy: ElectronicCopy;
    private type: ItemType;
    private searchCount: number;
    private rowNumber: number;
    private patron: Patron;
    private searchStatus: SearchStatus;
    private author: string;
    private callNumber: string;
    private title: string;
    private urgency: Urgency;
    private searchedLocations: Map<SearchLocation, boolean>;

    constructor(row: string[], rowNumber: number) {
        this.author = row[columns.author];
        this.callNumber = row[columns.callNumber];
        this.title = row[columns.title];

        this.listedOnReserve = this.ListedOnReserve(row[columns.onReserve]);
        this.markedLostBelievedReturned = this.BelievedReturned(row[columns.believedReturned]);
        this.placeHold = this.PlaceHold(row[columns.placeHold]);
        this.recommendedByProfessor = this.RecommendedByProfessor(row[columns.byProfessor]);
        this.recommendReplacement = this.RecommendReplacement(row[columns.replacementNeeded]);
        this.requestedButNotRequired = this.RequestedButNotRequired(row[columns.notRequired]);
        this.requiredForClass = this.RequiredForClass(row[columns.forClass]);
        this.requiredForSeminar = this.RequiredForSeminar(row[columns.forSeminar]);
        this.timestamp = this.Timestamp(row[columns.timestamp]);
        this.dateNoLongerNeeded = this.DateNoLongerNeeded(row[columns.dateNotNeeded]);
        this.electronicCopy = this.ElectronicCopy(row[columns.electronicCopy]);
        this.type = this.Type(row[columns.bookType]);
        this.patron = this.PatronInfo(row);
        this.searchStatus = this.SearchStatus(row[columns.searchStatus]);
        this.urgency = this.Urgency(row[columns.urgency]);
        this.searchCount = this.SearchCount(row[columns.searchCount]);
        this.searchedLocations = this.SearchedLocations(row[columns.searchLocations]);
        this.rowNumber = rowNumber;
    }

    public toJSON(): JSON {
        const obj: any = new Object();
        for (const prop in this) {
            if (prop && prop !== 'searchedLocation') {
                obj[prop] = this[prop];
                if (prop === 'timestamp') {
                    obj[prop] = this[prop].toLocaleString();
                } else if (prop === 'dateNoLongerNeeded') {
                    obj[prop] = this[prop].toLocaleString();
                }
            }
        }
        obj.searchedLocations = {};
        if (this.searchedLocations.size > 0) {
            for (const [k, v] of this.searchedLocations) {
                obj.searchedLocations[k] = v;
            }
        }
        return obj;
    }

    public getTitle() { return this.title; }

    public getSearchCount() { return this.searchCount; }

    public getCallNumber() { return this.callNumber; }

    public getRowNumber() { return this.rowNumber; }

    public updateSearchStatus(status: string) {
        this.searchStatus = this.SearchStatus(status);
    }

    public getStatus() { return this.searchStatus; }

    private SearchedLocations(column: string): Map<SearchLocation, boolean> {
        const result = new Map<SearchLocation, boolean>();
        if (column && column.trim()) {
            const locations = column.split(', ');
            for (const loc of locations) {
                result.set(parseLocation(loc), true);
            }
        }
        return result;
    }

    private SearchCount(column: string): number {
        if (column && column.trim()) {
            return Number.parseInt(column.trim(), 10);
        }
        return 0;
    }

    private RequiredForClass(column: string): boolean {
        if (column && column.trim()) {
            return column.includes(fromPatron.requiredForClass);
        }
        return false;
    }

    private RequiredForSeminar(column: string): boolean {
        if (column && column.trim()) {
            return column.includes(fromPatron.requiredForSeminar);
        }
        return false;
    }

    private RecommendedByProfessor(column: string): boolean {
        if (column && column.trim()) {
            return column.includes(fromPatron.recommendedByProfessor);
        }
        return false;
    }

    private RequestedButNotRequired(column: string): boolean {
        if (column && column.trim()) {
            return column.includes(fromPatron.requestedButNotRequired);
        }
        return false;
    }

    private ListedOnReserve(column: string): boolean {
        if (column && column.trim()) {
            return column.includes(fromVoyager.listedOnReserve);
        }
        return false;
    }

    private BelievedReturned(column: string): boolean {
        if (column && column.trim()) {
            return column.includes(fromVoyager.markedLostBelievedReturned);
        }
        return false;
    }

    private DateNoLongerNeeded(date: string): Date {
        if (date.trim()) {
            const myDate = date.split('/');
            const year = Number.parseInt(myDate[2], 10);
            const month = Number.parseInt(myDate[0], 10) + 1;
            const day = Number.parseInt(myDate[1], 10);

            return new Date(year, month, day);
        } else {
            return new Date();
        }
    }

    private ElectronicCopy(electronicCopy: string): ElectronicCopy {
        if (electronicCopy.trim()) {
            return electronicCopy as unknown as ElectronicCopy;
        }
        return 'No';
    }

    private PlaceHold(placeHold: string): boolean {
        if (placeHold.trim()) {
            return placeHold.includes('Yes');
        }
        return false;
    }

    private PatronInfo(row: string[]): Patron {
        if (row) {
            const email = row[columns.patronEmail].trim();
            const name = row[columns.patronName].trim();
            const hNumber = row[columns.patronHNumber].trim();
            return {
                email,
                hNumber,
                name
            };
        }
        return {};
    }

    private RecommendReplacement(recommendReplacement: string): boolean {
        if (recommendReplacement.trim()) {
            return recommendReplacement.includes('Yes');
        }
        return false;
    }

    private SearchStatus(status: string): SearchStatus {
        if (status.trim()) {
            return status as SearchStatus;
        }
        return 'Not searched for yet';
    }

    private Timestamp(timestamp: string) {
        if (timestamp.trim()) {
            return new Date(timestamp);
        }
        return new Date();
    }

    private Type(typeTo: string): ItemType {
        if (typeTo.trim()) {
            return typeTo as ItemType;
        }
        return 'Bestsellers';
    }

    private Urgency(urgency: string): Urgency {
        if (urgency.trim()) {
            return Number.parseInt(urgency, 10) as Urgency;
        }
        return 0;
    }
}
