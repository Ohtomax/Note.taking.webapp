let note = {
            id: "",
            title: "",
            content: "",
            status: ""
        };

let listofdeleted = JSON.parse(localStorage.getItem('listdeleted')) || [];

let listofarc = JSON.parse(localStorage.getItem('listarc')) || [];

let listofnotes = JSON.parse(localStorage.getItem('localnotes')) || [];

function addnewnote(){
    document.getElementById("titleNote").value = "";
    document.getElementById("contentNote").value = "";
    notemodal.showModal();
};

function generateID(){
    return Date.now().toString()
} 

function savefunction(){
    const title = document.getElementById("titleNote").value.trim();
    const content = document.getElementById("contentNote").value.trim();

    note = {
        id: generateID(),
        title: title,
        content: content,
        status: "pending"
    };

    listofnotes.unshift({...note});

    document.getElementById("notemodal").close();

    nonotesID.style.display = "none";

    localStorage.setItem('localnotes', JSON.stringify(listofnotes));
    console.log(listofnotes);

    displaynotes(listofnotes)
};

function displaynotes(typeofnotes) {
    if (typeofnotes.length === 0) {
        document.getElementById("nonotesID").style.display = "flex";
        notecontainer.innerHTML = "";
    } 
    else {
        document.getElementById("nonotesID").style.display = "none";

        document.getElementById("notecontainer").innerHTML = typeofnotes.map(note => `
            <div 
                onclick="editnote('${note.id}')"
                class="note-block flex flex-col w-[280px] h-[350px] bg-white my-[20px] mx-[20px] py-[10px] px-[10px] rounded-[10px] gap-[6px] hover:shadow-lg group"
            >

                <!-- Top row -->
                <div class="flex flex-row justify-between">
                    
                    <!-- Title -->
                    <div class= "flex flex-row gap-[10px]">
                        <input type="checkbox" onclick = "event.stopPropagation()" class="note-checkbox" value = "${note.id}">
                        <h1 class="font-bold text-[18px] overflow-x-auto grow max-w-[200px] break-words">
                            ${note.title}
                        </h1>
                    </div>

                    <!-- Icons -->
                    <div class="flex flex-row justify-end items-center gap-[6px]">
                        <svg 
                            onclick="event.stopPropagation(); editnote('${note.id}')"
                            class="lg:hidden border-none rounded bg-gray-200 p-[4px] w-[20px] h-[20px] group-hover:block"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#191b23"
                        >
                            <path d="M184-184v-83.77l497.23-498.77q5.15-5.48 11.07-7.47 5.93-1.99 11.99-1.99 6.06 0 11.62 1.54 5.55 1.54 11.94 7.15l38.69 37.93q5.61 6.38 7.54 12 1.92 5.63 1.92 12.25 0 6.13-2.24 12.06-2.24 5.92-7.22 11.07L267.77-184H184Zm505.15-466.46L744-704.54 704.54-744l-54.08 54.85 38.69 38.69Z"/>
                        </svg>

                        <svg 
                            onclick="event.stopPropagation(); deletenote('${note.id}')"
                            class="lg:hidden border-none rounded bg-gray-200 p-[4px] w-[20px] h-[20px] group-hover:block"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#191b23"
                        >
                            <path d="M291-267.69 267.69-291l189-189-189-189L291-692.31l189 189 189-189L692.31-669l-189 189 189 189L669-267.69l-189-189-189 189Z"/>
                        </svg>
                    </div>
                </div>

                <!-- Content -->
                <h1 class="grow overflow-y-auto max-h-[250px] break-words">
                    ${note.content}
                </h1>

                <!-- Status Section -->
                <div class = "flex flex-row items-center text-center h-[40px] gap-[7px]">
                    <h1 class="font-semibold ">Status: </h1>
                    <select id="status-${note.id}" onclick= "event.stopPropagation();" onchange = "status('${note.id}', this.value)" class = "text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 py-[2px] px-[4px]">
                        <option value="pending" ${note.status === "pending" ? "selected" : ""}>Pending</option>
                        <option value="completed" ${note.status === "completed" ? "selected" : ""}>Completed</option>
                    </select>
                </div>
            </div>
        `).join("");

        document.querySelectorAll(".note-block");
    }
}


function deletenote(id){

    const deletednote = listofnotes.find(note => note.id == id)

    if (deletednote) {
        recentlydeleted(deletednote);
        console.log(listofdeleted)
    }

    listofnotes = listofnotes.filter(note => note.id != id);

    localStorage.setItem('localnotes', JSON.stringify(listofnotes));

    displaynotes(listofnotes)
}


function editnote(id){
    const editnote = listofnotes.find(note => note.id == id);
    document.getElementById("titleNoteEdit").value = editnote.title;
    document.getElementById("contentNoteEdit").value = editnote.content;
 
    notemodaledit.dataset.id = id;
    notemodaledit.showModal();
}

function savenewnote(){
    const id = notemodaledit.dataset.id;
    const editnote = listofnotes.find(note => note.id == id);

    editnote.title = document.getElementById("titleNoteEdit").value.trim();
    editnote.content = document.getElementById("contentNoteEdit").value.trim();

    localStorage.setItem('localnotes', JSON.stringify(listofnotes));
    displaynotes(listofnotes)
    notemodaledit.close();

}


function status(id, value){
    const statusofnote = listofnotes.find(note => note.id == id);
    
    if(statusofnote){
        statusofnote.status = value;
        localStorage.setItem('localnotes', JSON.stringify(listofnotes));
    }
}

function selectdeletion(){
    const selectnotestobedeleted = document.querySelectorAll(".note-checkbox:checked")

    const idstobedeleted = Array.from(selectnotestobedeleted).map(checkbox => checkbox.value);

    const notestotrash = listofnotes.filter(note => idstobedeleted.includes(note.id))

    notestotrash.forEach(
        note => {
            recentlydeleted(note)
        }
    )

    listofnotes = listofnotes.filter(note => !idstobedeleted.includes(note.id));

    localStorage.setItem('localnotes', JSON.stringify(listofnotes));
    displaynotes(listofnotes)
}

function markascompleted(){
    const selectednotestobecompleted = document.querySelectorAll(".note-checkbox:checked");

    const idstobemarkasdone = Array.from(selectednotestobecompleted).map(checkbox => checkbox.value);

    listofnotes.forEach(note => {
        if(idstobemarkasdone.includes(note.id)){
            note.status = "completed";
        }
    })

    localStorage.setItem('localnotes', JSON.stringify(listofnotes));
    displaynotes(listofnotes);
}   

function markaspending(){
    const selectednotestobepending = document.querySelectorAll(".note-checkbox:checked")

    const idstobemarkaspending = Array.from(selectednotestobepending).map(checkbox => checkbox.value)

    listofnotes.forEach(note => {
        if(idstobemarkaspending.includes(note.id)){
            note.status = "pending";
        }
    }) 

    localStorage.setItem('localnotes', JSON.stringify(listofnotes));
    displaynotes(listofnotes);
}

function addtoarchive(){
    const selectednotestobeadded = document.querySelectorAll(".note-checkbox:checked")

    const idstobeadded = Array.from(selectednotestobeadded).map(checkbox => checkbox.value)

    listofnotes.forEach(note => {
        if(idstobeadded.includes(note.id)){
            listofarc.push({
                id: note.id,
                title: note.title,
                content: note.content,
                status: note.status
            });
            localStorage.setItem('listarc', JSON.stringify(listofarc))
        }
    })

        listofnotes = listofnotes.filter(note => !idstobeadded.includes(note.id));
        localStorage.setItem('localnotes', JSON.stringify(listofnotes));

        displaynotes(listofnotes)
}

function addtomain(){
    const selectednotestobeaddtomain = document.querySelectorAll(".note-checkbox:checked")

    const idstobeaddedtomain = Array.from(selectednotestobeaddtomain).map(checkboxarc => checkboxarc.value)

    listofarc.forEach(note => {
        if(idstobeaddedtomain.includes(note.id)){
            listofnotes.push({
                id: note.id,
                title: note.title,
                content: note.content,
                status: note.status
            });
            localStorage.setItem('localnotes', JSON.stringify(listofnotes))
        }
    })

        listofarc = listofarc.filter(note => !idstobeaddedtomain.includes(note.id));

        localStorage.setItem('listarc', JSON.stringify(listofarc));

        displaynotes(listofarc)
}

function deleteallformain(){
    listofnotes = []
    localStorage.setItem('localnotes', JSON.stringify(listofnotes))
    displaynotes(listofnotes)
}

function deleteallforarc(){
    listofarc = []
    localStorage.setItem('listarc', JSON.stringify(listofarc))
    displaynotes(listofarc)
}


function recentlydeleted(note){
    listofdeleted.push({
            id: note.id,
            title: note.title,
            content: note.content,
            status: note.status
    })

    localStorage.setItem('listdeleted', JSON.stringify(listofdeleted))
} 

function addBackToMain(note){
    listofnotes.push({
            id: note.id,
            title: note.title,
            content: note.content,
            status: note.status
    });

    localStorage.setItem('localnotes', JSON.stringify(listofnotes));
}

function restoredeleted(){
    const selectnotestoberestored = document.querySelectorAll(".note-checkbox:checked")

    const idstoberestored = Array.from(selectnotestoberestored).map(checkbox => checkbox.value);

    const notestomain = listofdeleted.filter(note => idstoberestored.includes(note.id))

    notestomain.forEach(
        note => {
           addBackToMain(note);
        }
    )

    listofdeleted = listofdeleted.filter(note => !idstoberestored.includes(note.id));

    localStorage.setItem('listdeleted', JSON.stringify(listofdeleted));
    displaynotes(listofdeleted)
}   