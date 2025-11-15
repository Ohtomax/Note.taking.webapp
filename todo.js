let note = {
            id: "",
            title: "",
            content: ""
        };

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
        content: content
    };

    listofnotes.unshift({...note});

    document.getElementById("notemodal").close();

    nonotesID.style.display = "none";

    localStorage.setItem('localnotes', JSON.stringify(listofnotes));
    console.log(listofnotes);

    
};

function displaynotes(){
    if (listofnotes.length === 0) {
        document.getElementById("nonotesID").style.display = "flex";
    }
    else {
        document.getElementById("nonotesID").style.display = "none";
        document.getElementById("notecontainer").innerHTML = listofnotes.map(note => `
                    <div class="flex flex-col w-[280px] bg-white my-[20px] mx-[20px] py-[10px] px-[10px] rounded-[10px] gap-[6px] hover:shadow-lg group">
            <div class="flex flex-row justify-between">
                <div>
                    <h1 class="font-bold text-[18px]">
                        ${note.title}
                    </h1>
                </div>
                <div class="flex flex-row justify-end items-center gap-[6px]">
                     <img src="images/pensil.png" class="hidden border-none rounded bg-gray-200 p-[4px] w-[20px] h-[20px] group-hover:block">
                     <img src="images/trash.png" class="hidden border-none rounded bg-gray-200 p-[4px] w-[20px] h-[20px] group-hover:block">
                </div>
            </div> 
            <h1>
                ${note.content}
            </h1>
        </div>
            `).join("")
    }
}


