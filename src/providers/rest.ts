import { GanttItem, GanttLink, StringHash, Response, MovePosition } from "types";

interface AfterUpdateConfig<T> {
	task?: { (id:string, response:T) : void }
	link?: { (id:string, response:T) : void }
}
export default class RestDataProvider<T extends Response> {
	private _url: string;
	private _queue: StringHash<number>;
	private _updates: AfterUpdateConfig<T>;
	private _ids:Map<string, string>;

	constructor(url: string, updates: AfterUpdateConfig<T>){
		this._url = url;
		this._queue = {};
		this._updates = updates;
		this._ids = new Map<string, string>();
	}

	getData():Promise<{ tasks:GanttItem[], links: GanttLink[] }> {
		const tasks = fetch(this._url + "/tasks").then(a => a.json()) as Promise<GanttItem[]>;
		const links = fetch(this._url + "/links").then(a => a.json()) as Promise<GanttLink[]>;
	
		return Promise.all([tasks, links]).then(([tasks, links]) => {
			return { tasks, links };
		});
	}

	serializeTask(task:GanttItem):StringHash<number|string> {
		return {
			progress: task.progress||0,
			parent: task.parent ? (this._ids.get("t"+task.parent) || task.parent) : 0,
			text: task.text||"",
			details: task.details||"",
			duration: task.duration||1,
			start_date: this.dateFormat(task.start_date),
			end_date: this.dateFormat(task.end_date),
		};
	}

	serializeMove(obj:MovePosition):StringHash<number|string> {
		return {
			mode: obj.mode,
			target: obj.target ? (this._ids.get("t"+obj.target) || obj.target) : 0,
			parent: obj.parent ? (this._ids.get("t"+obj.parent) || obj.parent) : 0
		};
	}

	serializeLink(link:GanttLink):StringHash<number|string> {
		return {
			source: this._ids.get("t"+link.source) || link.source,
			target: this._ids.get("t"+link.target) || link.target,
			type: link.type,
		};
	}

	dateFormat(a:string|Date):string {
		if (typeof a === "string")
			return a;
		return a.getFullYear()+"-"+(a.getMonth()+1)+"-"+a.getDate()+" 00:00"
	}

	saveData(ev:{ action:string, obj:GanttItem|GanttLink|MovePosition, mode?:string }):void {
		const { action, obj } = ev;

		let sid = obj.id.toString();
		const prefix = action[action.lastIndexOf("-")+1];
		sid = this._ids.get(prefix+sid) || sid;

		switch (action) {
			case "update-task":{
				// debounce updates
				const tid = this._queue[sid];
				if (tid) clearTimeout(tid);
				this._queue[sid] = setTimeout(() => {
					return this.send(
						"/tasks/" + sid,
						"PUT",
						this.serializeTask(obj as GanttItem)
					);
				}, 1000);
				break;
			}
			case "reorder-task":
				this.send(`/tasks/${sid}/position`, "PUT", this.serializeMove(obj as MovePosition));
				break;
			case "add-task":
				this.send("/tasks", "POST", { mode:ev.mode, ...this.serializeTask(obj as GanttItem) })
					.then((res:T) => {
						if (res.id)
							this._ids.set("t"+sid, res.id.toString());
						if (this._updates && this._updates.task) 
							this._updates.task(sid, res);
					});
				break;
			case "delete-task":
				this.send("/tasks/" + sid, "DELETE");
				break;
			case "update-link":
				this.send("/links/" + sid, "PUT", this.serializeLink(obj as GanttLink));
				break;
			case "add-link":
				this.send("/links", "POST", this.serializeLink(obj as GanttLink))
					.then((res:T) => {
						if (res.id)
							this._ids.set("l"+sid, res.id.toString());
						if (this._updates && this._updates.link) 
							this._updates.link(sid, res);
					});
				break;
			case "delete-link":
				this.send("/links/" + sid, "DELETE");
				break;
		}
	}

	send(url:string, method:string, body?:StringHash<number|string>):Promise<T> {
		const config:RequestInit = {
			method,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		};

		if (body) {
			const line = [];
			for (const key in body) line.push(`${key}=${encodeURIComponent(body[key])}`);

			config.body = line.join("&");
		}

		return fetch(this._url+url, config)
			.then(a => a.json());
	}

}

