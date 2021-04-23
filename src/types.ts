export interface GanttItem {
    id: number|string;
    text: string;
    progress: number;

    parent?: number|string;
    details?: string;
	duration?: number;
	start_date?: string | Date;
	end_date?: string | Date;
}

export interface GanttLink {
    id: number|string;
    source: number;
    target: number;
    type: number;
}

export interface StringHash<T> {
	[key:string]:T;
}

export interface Response {
    id?: number|string;
}

export interface MovePosition {
    id: number|string;
    mode: string;
    target?: number|string;
    parent?: number|string;
}