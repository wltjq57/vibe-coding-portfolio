// Firebase는 index.html에서 로드됨
// Firebase가 로드될 때까지 기다림
let database, ref, push, set, onValue, remove, update, todosRef;

// 할일 데이터 저장소
let todos = [];
let currentFilter = 'all';

// DOM 요소 가져오기
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

// Firebase 로드 대기 후 초기화
function waitForFirebase() {
    if (window.firebaseDatabase) {
        // Firebase가 로드되었으면 변수 할당
        database = window.firebaseDatabase;
        ref = window.firebaseRef;
        push = window.firebasePush;
        set = window.firebaseSet;
        onValue = window.firebaseOnValue;
        remove = window.firebaseRemove;
        update = window.firebaseUpdate;
        todosRef = window.todosRef;
        
        console.log('✅ Firebase Realtime Database 연결 완료!');
        console.log('Database:', database);
        console.log('Database URL:', database.app.options.databaseURL);
        console.log('Todos Reference:', todosRef.toString());
        
        // 초기화 실행
        init();
    } else {
        // 아직 로드되지 않았으면 잠시 후 다시 시도
        setTimeout(waitForFirebase, 100);
    }
}

// 페이지 로드 후 Firebase 대기
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForFirebase);
} else {
    waitForFirebase();
}

function init() {
    setupEventListeners();
    loadTodos();
}

// Realtime Database에서 할일 목록 실시간 로드
function loadTodos() {
    // 실시간 업데이트 리스너
    onValue(todosRef, (snapshot) => {
        todos = [];
        const data = snapshot.val();
        
        if (data) {
            // Realtime Database는 객체 형태로 데이터를 반환
            Object.keys(data).forEach((key) => {
                todos.push({
                    id: key,
                    ...data[key]
                });
            });
            
            // 생성일 기준으로 정렬
            todos.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateB - dateA;
            });
        }
        
        renderTodos();
        updateStats();
    }, (error) => {
        console.error('할일 목록 로드 실패:', error);
        alert('할일 목록을 불러오는데 실패했습니다.');
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 할일 추가
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // 필터 버튼
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    // 완료된 항목 삭제
    clearCompletedBtn.addEventListener('click', clearCompleted);
}

// 할일 추가 - Firebase Realtime Database 사용
async function addTodo() {
    const text = todoInput.value.trim();
    
    // 입력값 검증
    if (text === '') {
        alert('할일을 입력해주세요!');
        return;
    }

    // Firebase 연결 확인
    if (!database || !push || !set || !todosRef) {
        console.error('Firebase 연결 상태:', {
            database: !!database,
            push: !!push,
            set: !!set,
            todosRef: !!todosRef
        });
        alert('Firebase가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    try {
        // 버튼 비활성화 (중복 클릭 방지)
        addBtn.disabled = true;
        addBtn.textContent = '추가 중...';

        // 새 할일 데이터 생성
        const newTodo = {
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        console.log('할일 추가 시작:', newTodo);
        console.log('Firebase Database URL:', database.app.options.databaseURL);
        console.log('Todos Reference:', todosRef.toString());

        // Firebase Realtime Database에 새 항목 추가
        // push()는 자동으로 고유 키를 생성한 새 참조를 반환
        const newTodoRef = push(todosRef);
        console.log('새 참조 생성됨:', newTodoRef.toString());
        console.log('생성된 키:', newTodoRef.key);
        
        // set()으로 데이터를 Firebase에 저장
        console.log('Firebase에 데이터 저장 중...');
        await set(newTodoRef, newTodo);
        console.log('✅ 할일이 Firebase Realtime Database에 성공적으로 추가되었습니다!');
        console.log('저장된 데이터:', {
            key: newTodoRef.key,
            path: newTodoRef.toString(),
            data: newTodo
        });
        
        // 성공 시 입력 필드 초기화
        todoInput.value = '';
        
    } catch (error) {
        console.error('❌ 할일 추가 실패:', error);
        console.error('에러 상세:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        alert(`할일 추가에 실패했습니다.\n\n에러: ${error.message || '알 수 없는 오류'}\n\n콘솔을 확인해주세요.`);
    } finally {
        // 버튼 상태 복원
        addBtn.disabled = false;
        addBtn.textContent = '추가';
    }
}

// 할일 목록 렌더링
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<li class="empty-state">할일이 없습니다</li>';
        return;
    }

    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo('${todo.id}')"
            >
            <span class="todo-text" id="text-${todo.id}">${escapeHtml(todo.text)}</span>
            <div class="todo-actions" id="actions-${todo.id}">
                <button class="edit-btn" onclick="editTodo('${todo.id}')">수정</button>
                <button class="delete-btn" onclick="deleteTodo('${todo.id}')">삭제</button>
            </div>
        </li>
    `).join('');
}

// 필터링된 할일 가져오기
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// 할일 완료 토글
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
        const todoRef = ref(database, `todos/${id}`);
        await update(todoRef, {
            completed: !todo.completed
        });
    } catch (error) {
        console.error('할일 상태 변경 실패:', error);
        alert('할일 상태 변경에 실패했습니다.');
    }
}

// 할일 수정
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const textElement = document.getElementById(`text-${id}`);
    const actionsElement = document.getElementById(`actions-${id}`);
    
    const currentText = todo.text;
    textElement.innerHTML = `
        <input 
            type="text" 
            class="todo-text editing" 
            value="${escapeHtml(currentText)}"
            id="edit-input-${id}"
            onkeypress="handleEditKeyPress(event, '${id}')"
        >
    `;
    
    actionsElement.innerHTML = `
        <button class="save-btn" onclick="saveTodo('${id}')">저장</button>
        <button class="cancel-btn" onclick="cancelEdit('${id}')">취소</button>
    `;

    // 입력 필드에 포커스
    const editInput = document.getElementById(`edit-input-${id}`);
    editInput.focus();
    editInput.select();
}

// 수정 중 Enter 키 처리
function handleEditKeyPress(event, id) {
    if (event.key === 'Enter') {
        saveTodo(id);
    }
}

// 할일 저장
async function saveTodo(id) {
    const editInput = document.getElementById(`edit-input-${id}`);
    const newText = editInput.value.trim();
    
    if (newText === '') {
        alert('할일을 입력해주세요!');
        return;
    }

    try {
        const todoRef = ref(database, `todos/${id}`);
        await update(todoRef, {
            text: newText
        });
    } catch (error) {
        console.error('할일 수정 실패:', error);
        alert('할일 수정에 실패했습니다.');
    }
}

// 수정 취소
function cancelEdit(id) {
    renderTodos();
}

// 할일 삭제
async function deleteTodo(id) {
    if (confirm('정말 삭제하시겠습니까?')) {
        try {
            const todoRef = ref(database, `todos/${id}`);
            await remove(todoRef);
        } catch (error) {
            console.error('할일 삭제 실패:', error);
            alert('할일 삭제에 실패했습니다.');
        }
    }
}

// 완료된 항목 모두 삭제
async function clearCompleted() {
    const completedTodos = todos.filter(t => t.completed);
    const completedCount = completedTodos.length;
    
    if (completedCount === 0) {
        alert('완료된 항목이 없습니다.');
        return;
    }

    if (confirm(`완료된 ${completedCount}개의 항목을 모두 삭제하시겠습니까?`)) {
        try {
            // Realtime Database에서는 여러 항목을 한 번에 업데이트
            const updates = {};
            completedTodos.forEach(todo => {
                updates[`todos/${todo.id}`] = null; // null로 설정하면 삭제됨
            });
            await update(ref(database), updates);
        } catch (error) {
            console.error('완료된 항목 삭제 실패:', error);
            alert('완료된 항목 삭제에 실패했습니다.');
        }
    }
}

// 통계 업데이트
function updateStats() {
    const total = todos.length;
    const active = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t => t.completed).length;
    
    todoCount.textContent = `총 ${total}개 (진행중: ${active}개, 완료: ${completed}개)`;
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 전역 함수로 export (onclick 핸들러 접근용)
window.toggleTodo = toggleTodo;
window.editTodo = editTodo;
window.saveTodo = saveTodo;
window.cancelEdit = cancelEdit;
window.deleteTodo = deleteTodo;
window.handleEditKeyPress = handleEditKeyPress;
