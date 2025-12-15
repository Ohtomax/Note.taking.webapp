/**
 * Industry Standard Note App
 * Uses a Class-based architecture for better state management.
 */
class NoteApp {
    constructor() {
        // State
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.archive = JSON.parse(localStorage.getItem('archive')) || [];
        this.trash = JSON.parse(localStorage.getItem('trash')) || [];
        
        this.currentView = 'active'; // 'active', 'archive', 'trash'
        this.currentEditId = null;
        this.selectedIds = new Set();
        this.searchQuery = "";

        // DOM Elements
        this.container = document.getElementById('notes-container');
        this.emptyState = document.getElementById('empty-state');
        this.modal = document.getElementById('note-modal');
        this.bulkActions = document.getElementById('bulk-actions');
        
        // Initial Render
        this.render();
    }

    // --- Core Data Operations ---

    saveToStorage() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
        localStorage.setItem('archive', JSON.stringify(this.archive));
        localStorage.setItem('trash', JSON.stringify(this.trash));
    }

    get visibleNotes() {
        let source = [];
        if (this.currentView === 'active') source = this.notes;
        else if (this.currentView === 'archive') source = this.archive;
        else if (this.currentView === 'trash') source = this.trash;

        if (!this.searchQuery) return source;

        const lowerQ = this.searchQuery.toLowerCase();
        return source.filter(n => 
            n.title.toLowerCase().includes(lowerQ) || 
            n.content.toLowerCase().includes(lowerQ)
        );
    }

    // --- Actions ---

    addNote(title, content) {
        const newNote = {
            id: crypto.randomUUID(), // Industry standard ID generation
            title: title || "Untitled",
            content: content,
            updatedAt: new Date().toISOString(),
            status: 'pending' // pending, completed
        };
        this.notes.unshift(newNote);
        this.saveToStorage();
        this.render();
    }

    updateNote(id, title, content) {
        // Find in current view
        const list = this.getCurrentList();
        const note = list.find(n => n.id === id);
        if (note) {
            note.title = title;
            note.content = content;
            note.updatedAt = new Date().toISOString();
            this.saveToStorage();
            this.render();
        }
    }

    // Moving items between arrays (Active <-> Archive <-> Trash)
    moveNote(id, fromList, toList) {
        const index = fromList.findIndex(n => n.id === id);
        if (index > -1) {
            const [note] = fromList.splice(index, 1);
            // If moving to trash, keeping original timestamp might be useful, 
            // but usually we just push.
            toList.unshift(note); 
            this.saveToStorage();
            this.render();
        }
    }

    deletePermanently(id) {
        this.trash = this.trash.filter(n => n.id !== id);
        this.saveToStorage();
        this.render();
    }

    // --- Bulk Actions & UI Interaction ---

    handleSearch(query) {
        this.searchQuery = query.trim();
        this.render();
    }

    switchView(viewName) {
        this.currentView = viewName;
        this.selectedIds.clear();
        this.renderUIState(); // Updates sidebar active state
        this.render();
    }

    toggleSelect(id) {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
        this.renderBulkActions();
        this.render(); // Re-render to show checkbox state
    }

    // --- Modal Logic ---

    openModal(noteId = null) {
        this.currentEditId = noteId;
        const titleInput = document.getElementById('note-title');
        const contentInput = document.getElementById('note-content');
        const modalTitle = document.getElementById('modal-title');

        if (noteId) {
            const list = this.getCurrentList();
            const note = list.find(n => n.id === noteId);
            titleInput.value = note.title;
            contentInput.value = note.content;
            modalTitle.innerText = "Edit Note";
        } else {
            titleInput.value = "";
            contentInput.value = "";
            modalTitle.innerText = "New Note";
        }
        this.modal.showModal();
    }

    closeModal() {
        this.modal.close();
        this.currentEditId = null;
    }

    saveNote() {
        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').value.trim();

        if (!title && !content) {
            this.closeModal();
            return;
        }

        if (this.currentEditId) {
            this.updateNote(this.currentEditId, title, content);
        } else {
            this.addNote(title, content);
        }
        this.closeModal();
    }

    // --- Bulk Operations ---

    bulkAction(action) {
        const ids = Array.from(this.selectedIds);
        
        ids.forEach(id => {
            if (action === 'trash') {
                if (this.currentView === 'active') this.moveNote(id, this.notes, this.trash);
                else if (this.currentView === 'archive') this.moveNote(id, this.archive, this.trash);
                else if (this.currentView === 'trash') this.deletePermanently(id);
            } 
            else if (action === 'archive') {
                if (this.currentView === 'active') this.moveNote(id, this.notes, this.archive);
                else if (this.currentView === 'trash') this.moveNote(id, this.trash, this.archive); // Restore to archive
            }
            else if (action === 'restore') {
                // Restore logic mostly for trash/archive back to active
                if (this.currentView === 'trash') this.moveNote(id, this.trash, this.notes);
                if (this.currentView === 'archive') this.moveNote(id, this.archive, this.notes);
            }
        });

        this.selectedIds.clear();
        this.renderBulkActions();
    }

    // --- Rendering ---

    getCurrentList() {
        if (this.currentView === 'active') return this.notes;
        if (this.currentView === 'archive') return this.archive;
        return this.trash;
    }

    renderUIState() {
        // Highlight active nav item
        document.querySelectorAll('.nav-item').forEach(el => {
            el.className = el.className.replace('text-blue-600 bg-blue-50', 'text-gray-600 hover:bg-gray-100');
        });
        const activeNav = document.getElementById(`nav-${this.currentView}`);
        if(activeNav) {
            activeNav.className = activeNav.className.replace('text-gray-600 hover:bg-gray-100', 'text-blue-600 bg-blue-50');
        }

        // Show/Hide Restore button in bulk actions based on view
        const restoreBtn = document.getElementById('bulk-restore-btn');
        if (this.currentView === 'trash' || this.currentView === 'archive') {
            restoreBtn.classList.remove('hidden');
        } else {
            restoreBtn.classList.add('hidden');
        }
    }

    renderBulkActions() {
        if (this.selectedIds.size > 0) {
            this.bulkActions.style.display = 'flex';
            document.getElementById('selected-count').innerText = this.selectedIds.size;
        } else {
            this.bulkActions.style.display = 'none';
        }
    }

    // Secure HTML Rendering (Prevents XSS)
    escapeHtml(str) {
        if(!str) return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    render() {
        const data = this.visibleNotes;
        this.container.innerHTML = "";

        if (data.length === 0) {
            this.emptyState.style.display = 'flex';
        } else {
            this.emptyState.style.display = 'none';
            
            data.forEach(note => {
                const isSelected = this.selectedIds.has(note.id);
                
                // Create Card Element
                const card = document.createElement('div');
                card.className = `note-card group relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`;
                
                // Click to Edit (unless clicking checkbox/actions)
                card.onclick = (e) => {
                    // Prevent edit if clicking checkbox or action buttons
                    if (e.target.closest('button') || e.target.closest('input')) return;
                    // Prevent edit if in Trash
                    if (this.currentView !== 'trash') this.openModal(note.id);
                };

                // Truncate content for preview
                const previewContent = note.content.length > 150 ? note.content.substring(0, 150) + "..." : note.content;

                card.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-gray-800 text-lg break-words w-full pr-8">${this.escapeHtml(note.title)}</h3>
                        
                        <div class="absolute top-5 right-5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity">
                             <input type="checkbox" 
                                class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                ${isSelected ? 'checked' : ''}
                                onchange="app.toggleSelect('${note.id}')"
                             >
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed break-words">${this.escapeHtml(previewContent)}</p>
                    
                    <div class="mt-4 flex items-center justify-between">
                        <span class="text-xs text-gray-400 font-medium">${new Date(note.updatedAt).toLocaleDateString()}</span>
                        
                        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            ${this.currentView !== 'trash' ? `
                                <button onclick="app.moveNote('${note.id}', app.getCurrentList(), app.archive)" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded" title="Archive">
                                    <i class="ph ph-archive"></i>
                                </button>
                                <button onclick="app.moveNote('${note.id}', app.getCurrentList(), app.trash)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded" title="Delete">
                                    <i class="ph ph-trash"></i>
                                </button>
                            ` : `
                                <button onclick="app.moveNote('${note.id}', app.trash, app.notes)" class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded" title="Restore">
                                    <i class="ph ph-arrow-u-up-left"></i>
                                </button>
                                <button onclick="app.deletePermanently('${note.id}')" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded" title="Delete Forever">
                                    <i class="ph ph-x-circle"></i>
                                </button>
                            `}
                        </div>
                    </div>
                `;
                this.container.appendChild(card);
            });
        }
    }
}

// Initialize App
const app = new NoteApp();