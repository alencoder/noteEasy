class note extends storage {
  constructor(){
    super();
    this.id = this.getID();
    this.temp = [];
  }
  async getID(request){
    let notes = document.querySelectorAll('.noteEx0A');
    let id ;
    if(notes.length > 0){
    	 id = notes[notes.length-1].idnote;
    	 id++;
    }else{
		  id = 1;	
    }
    if(request){
      let repeat = true;
      let key = id;
      return await new Promise(async(resolve, reject)=>{
          do{
            let res = await new Promise((resolve, reject)=>{
                chrome.storage.sync.get([request.url+key], function(res){
                    if(res[request.url+key]){
                      reject();
                    }else{
                      resolve(key);
                    }
                });     
            }).then( function(ID){ 
              repeat = false; 
              resolve(ID);
            }, () =>{ key++ });
          } while (repeat == true);
      });
    }else{
      return id;
    }
  }
 async createNote(request, control_id ='auto', position = "center"){
      let id;
      if(control_id == 'auto'){
        id= await this.getID(request);
      }else{
        id = control_id;
      }
      this.id = id;
      function requestApply(noteModel, request){
        noteModel.note.style.background = request.noteColor;
        noteModel.text.style.color = request.fontColor;
      }
      let appendNote = (note) =>{
        note.style.height = document.body.clientHeight+'px';
        let referenceNode = () =>{
          let ID = this.getID();
          if(ID == 1){
          	return document.body.children[0];
          }else{
          	return document.body.children[ID];
          }
        }
        document.body.insertBefore(note, referenceNode());
      }
      let centerNote = (model)=>{
        model.note.style.position = 'absolute';
        model.note.style.top = (window.scrollY+(model.note.clientHeight/2))+"px";
        model.note.style.left = model.note.offsetLeft+"px"; 
        model.area.style.visibility = 'hidden';
        model.note.style.visibility = 'visible';
      }
      let setPosition = (x, y) =>{
      	model.note.style.position = 'absolute';
      	model.note.style.top = y;
        model.note.style.left = x; 
        model.area.style.visibility = 'hidden';
        model.note.style.visibility = 'visible';
      }
      let create=(tag, name)=>{
        let el = document.createElement(tag);
        el.classList+= name+'Ex0A';
        el.id = name+"Ex"+id;  
        return el;
      }
       let model  = {
          area: create('div', 'area'),
          note: create('div', 'note'),
          span: create('span', 'remove'),
          tack: create('div', 'tack'),
          info: create('span', 'message'),
          text: create('div', 'paper'),

          fusion: function(){
            this.tack.appendChild(this.span);
            this.note.appendChild(this.info)
            this.note.appendChild(this.tack);
            this.note.appendChild(this.text);
            this.area.appendChild(this.note);
            return this.area;
          }
      }
      let addProps = (model) =>{
        model.text.classList+=" notranslate";
        model.note.fontColor = request.fontColor;
        model.note.backColor = request.noteColor;
        for(let key in model){
          if(model[key]!='fusion'){
            model[key].idnote = model.note.id.replace('noteEx', "");
          }
        }
      model.span.delete = () =>{
        document.body.removeChild(
              document.getElementById('areaEx'+id)
        );
      }
      model.info.show = function(message, time=2000){
            this.textContent = message;
            this.style.setProperty('height', 'auto', 'important');
            this.style.setProperty('padding', '2px 4px', 'important');
            
            return setTimeout(()=>{
              this.textContent = "";
              this.style.setProperty('height', '0', 'important');
              this.style.setProperty('padding', '0px 0px', 'important');
            },time)
      }
      model.area.saveAuto = (time) =>{
        model.text.addEventListener('keyup', (e) =>save(e, 2000));
        model.note.addEventListener('dragend', (e) =>save(e, 0));
          let save = (e, time)=>{
            if( model.text.textContent != "" ){
              if(this.temp[id]){
                clearTimeout(this.temp[id]);
              }   
              this.temp[id] = setTimeout(()=>{
                let id = model.note.idnote;
  
                  this.save(request.url+id, {
                    fontColor:request.fontColor,
                    noteColor:request.noteColor,
                    text: model.text.textContent,
                    id: id,
                    url:request.url,
                    x: model.note.style.left,
                    y: model.note.style.top
                });
                  model.info.show('Guardado');
              }, time);
            }
          }
        }
      }
      let activeProps = function(model){
        model.text.textContent = request.text;
        model.span.idExtension = request.url+model.span.idnote;
        model.area.saveAuto(2000);
        model.span.addEventListener('click',function(){
          chrome.storage.sync.remove([request.url+this.idnote], ()=>{
            this.delete();
          });
        }, false);
        model.text.contentEditable= "true";
      }
    	if(!request.text){request.text = ""}
        requestApply(model, request);
        addProps(model);
        activeProps(model);
        appendNote( model.fusion() );
        if (position == 'center') {
          centerNote(model);
        }else{
          setPosition(request.x, request.y);
        }

	    
	    return id;
  }
  cleanNotesPageDynamic(){
    document.querySelectorAll('.removeEx0A').forEach( function(element, index) {
     element.delete();
    });
  }
  async loadNotes(request){
    for (let i = 1; i < 100; i++) {
	    const note = await new Promise((resolve, reject) => {
	     	this.load(request.url+i, (res)=>{
		     	if(res){
		    		resolve(res);
		      }
	    	})
	    });
	    if(note[request.url+i]){
        let exist = document.getElementById('noteEx'+note[request.url+i].id);
        if(!exist){
          this.createNote(note[request.url+i], i, false);
          this.onDrag();
        }
	    }
    }
  }
}