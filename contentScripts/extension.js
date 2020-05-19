class extension extends note{
	constructor(){
		super();
	}

	async deleteAllHere(rq, remove = true){
		let count = 0;
		let el = document.querySelectorAll('.removeEx0A');
		let notes = el.length > 0 ? el : el[0];
		let nrNotes = notes ? notes.length: false;
		if(nrNotes == false){
			return {notesDelete: '0'}
		}
		const note = await new Promise( (resolve, reject) => {
		notes.forEach( async (element, index) => {
			if(remove == true){
		     	await chrome.storage.sync.remove([element.idExtension], ()=>{
	            	element.delete();
	            	count++;
	            	if(count == nrNotes){
	            		resolve();
	            	}
          		});
          	}else{
          		element.delete();
          	}
	    	});
		});
		return {notesDelete:count};
	}
}
let noteasy = new extension();

noteasy.cathMessage( async(request)=>{

	if(typeof noteasy[request.action] == 'function'){
		let val = await noteasy[request.action](request);
		noteasy.onDrag();
		return val;
	}
});