export interface GanttItem {
    id: number;
    serverId?:number;
    text: string;
    progress: number;

    details?: string;
	duration?: number;
	start_date?: string | Date;
	end_date?: string | Date;
}
export interface GanttItemData extends GanttItem {
	$level:number;
	data: GanttItemData[];
	open: boolean;
    parent: number;
    type?: string;

	start_date?: Date;
    end_date?: Date;
    
    $x?: number;
    $y?: number;
    $h?: number;
    $w?: number;
}

export interface GanttLink {
    id: number;
    serverId?:number;
    source: number;
    target: number;
    type: number;
}
export interface GanttLinkData extends GanttLink {
    id: number;
    $p?: string;
}

export interface NumericHash<T> {
	[key:number]:T;
}
export interface StringHash<T> {
	[key:string]:T;
}

export interface Response {
    id?: number|string;
}
