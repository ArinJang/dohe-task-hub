document.addEventListener('DOMContentLoaded', function() {
    const sideList = document.getElementById('side-list');
    const weekDisplay = document.getElementById('week-display');
    const navigationBar = document.getElementById('navigation-bar');
    const listDetail = document.getElementById('list-detail');
    const taskInput = document.getElementById('taskInput');
    const workInput = document.getElementById('workInput');
    const taskInputArea = document.querySelector('.task-input');
    const workInputArea = document.querySelector('.work-input');
    const groupInputArea = document.querySelector('.group-input');
    const routineInputArea = document.querySelector('.routine-input');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const dayList = document.getElementById('dayList');
    const assignedToMeList = document.getElementById('assignedToMeList');
    const daysList = document.querySelector('.days-list');
    const taskDetail = document.getElementById('taskDetail');
    const taskForm = document.getElementById('taskForm');
    const successModal = document.getElementById('successModal');
    const closeModal = document.querySelector('#successModal .close');
    let categoriesList = [];
    let dayDateMap = new Map(); // 선택된 주의 요일과 날짜 저장
    const addDateButton = document.getElementById('addDateButton');
    const addSubTaskButton = document.getElementById('addSubTaskButton');
    const doDatesContainer = document.getElementById('doDatesContainer');
    const subTasksContainer = document.getElementById('subTasksContainer');
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
    const deleteConfirmationModalWork = document.getElementById('deleteConfirmationModalWork');
    const clearParentTaskModal = document.getElementById('clearParentTaskModal');
    const saveChangesButton = document.getElementById('saveChangesButton');
    let daysListVisible = true;
    let selectedDate = null;
    let selectedSide = 'week';
    const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    var selectedNav = null;
    var selectedDay = null;
    const validationModal = document.getElementById('validationModal');
    var taskDetailContent = document.getElementById('taskDetailContent');
    var detailElements = taskDetailContent.querySelectorAll('input, select, textarea');
    const taskMemoContent = document.getElementById('taskMemo');
    let orderInCertainStatus = null;
    sessionStorage.setItem('ifLoggedIn', 'false');
    var subTaskMemoUpdateParentId = false;
    var subTaskMemoUpdateSubId = false;
    let doDatesArray;

    const routineDate = document.getElementById('routineDate');
    const routineDay = document.getElementById('routineDay');
    const routineMonth = document.getElementById('routineMonth');
    const routineDayGroup = document.getElementById('routineDayGroup');

    const loginModal = document.getElementById('loginModal');
    const logoutButton = document.getElementById('logoutButton');
    const closeBtn = document.getElementsByClassName('close')[0];
    const addUserModal = document.getElementById('addUserModal');

    const userInfoDiv = document.getElementById("user-info");

    search(); // index.html 함수
    const sessionUserName = sessionStorage.getItem("sessionUserName");
    const localUserName = localStorage.getItem("localUserName");
    const localPassword = localStorage.getItem("localPassword");
    const rememberMeCheckbox = document.getElementById("rememberMe");

    console.log("*localStorage:", localUserName);
    console.log("*sessionStorage:", sessionUserName);

    if (localUserName) {
        document.getElementById("username").value = localUserName;
        rememberMeCheckbox.checked = true;
    }
    if (localPassword) {
        document.getElementById("password").value = localPassword;
    }

    document.getElementById('loginForm').addEventListener('submit', function(event) {
        const rememberMeCheckbox = document.getElementById("rememberMe");
        if (rememberMeCheckbox.checked) {
            localStorage.setItem("localUserName", document.getElementById("username").value);
            localStorage.setItem("localPassword", document.getElementById("password").value);
        } else {
            localStorage.removeItem("localUserName");
            localStorage.removeItem("localPassword");
        }
    });

    if (sessionUserName !== null && sessionUserName !== '' && sessionUserName !== 'null') {
        loginModal.style.display = 'none';  // 로그인 상태: 모달 숨김
        logoutButton.style.display = 'inline';  // 로그인 상태: 로그아웃 버튼 표시
    } else {
        loginModal.style.display = 'block'; // 로그아웃 상태: 모달 표시
        logoutButton.style.display = 'none';  // 로그아웃 상태: 로그아웃 버튼 숨김

//    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//            document.getElementById("username").value = 'admin';//////////////////////////////////////////////////////////////////////////////////
//            document.getElementById("password").value = 'admin';//////////////////////////////////////////////////////////////////////////////////
//            document.getElementById('loginSubmit').click();///////////////////////////////////////////////////////////////////////////////////////
//    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }

    document.getElementById('addUser').addEventListener('click', function() {
        addUserModal.style.display = 'block';
    });
    document.querySelector('.close').addEventListener('click', () => {
        addUserModal.style.display = 'none';
    });

    const statusMap = { // "side의 data-side" : "status"
//        'default': 1,
        'completed': 2,
        'completedW': 2,
//        'canceled': 3,
        'onhold': 4,
        'delegation': 5,
        'plan': 6
    };

    // Define your initial tasks array (this should be replaced with your actual data fetching logic)
    let tasks = [
        { task_id: 1, task_content: 'Task 1', due_date: '2024-08-12', day_of_week: 'Monday', status: 'In Progress' },
        { task_id: 2, task_content: 'Task 2', due_date: '2024-08-13', day_of_week: 'Tuesday', status: 'Completed' },
        // ... more tasks
    ];

    var tasksByDay = tasks.reduce((acc, task) => {
        const day = task.day_of_week; // 각 task의 day_of_week 속성 값 추출
        if (!acc[day]) { // 해당 요일에 대한 배열이 아직 존재하지 않으면
            acc[day] = []; // 새로운 배열을 생성
        }
        acc[day].push(task); // 해당 요일의 배열에 task를 추가
        return acc; // 누적기(acc)를 반환하여 다음 반복에서 계속 사용
    }, {});

    var tasksByWork = tasks.reduce((acc, task) => {
        const work = task.work_name; // 각 task의 day_of_week 속성 값 추출
        if (!acc[work]) { // 해당 요일에 대한 배열이 아직 존재하지 않으면
            acc[work] = []; // 새로운 배열을 생성
        }
        acc[work].push(task); // 해당 요일의 배열에 task를 추가
        return acc; // 누적기(acc)를 반환하여 다음 반복에서 계속 사용
    }, {});

    let currentMonth = new Date().getMonth(); // 0-based index (0 = January)
    let currentYear = new Date().getFullYear();
    let currentWeek = getWeekOfMonth(new Date());
//    console.log('시작: ',currentYear,currentMonth,currentWeek);

    const categories = {
        week: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        work: ['All', 'Personal', 'Dohe'],
        delegation: ['Task A', 'Task B', 'Task C'],
        completed: ['Task 1', 'Task 2', 'Task 3']
    };

    window.addEventListener('beforeunload', function() {
        sessionStorage.clear(); // sessionStorage 데이터 삭제
    });

    function getWeekOfMonth(date) {
        const dayOfMonth = date.getDate();
        const dayOfWeek = date.getDay() || 7; // Make Sunday (0) be treated as 7
        const startOfWeek = new Date(date.getFullYear(), date.getMonth(), dayOfMonth - dayOfWeek + 1);
        const firstMonday = new Date(date.getFullYear(), date.getMonth(), 1);

        if (firstMonday.getDay() !== 1) {
            firstMonday.setDate(firstMonday.getDate() + ((8 - firstMonday.getDay()) % 7));
        }

        const weekNumber = Math.ceil(((startOfWeek - firstMonday) / 86400000 + 1) / 7);
        return weekNumber;
    }

    function getStartDateOfWeek(year, month, week) {
        const firstDayOfMonth = new Date(year, month, 1);
        const firstMonday = firstDayOfMonth.getDate() + (1 - firstDayOfMonth.getDay() + 7) % 7;
        const startDate = new Date(year, month, firstMonday + (week - 1) * 7);
//        console.log('getStartDateOfWeek함수- ',startDate);
        return startDate;
    }

    function getFormattedWeekRange(startDate) {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // One week later
        const startMonthDay = `${startDate.getMonth() + 1}/${startDate.getDate()}`;
        const endMonthDay = `${endDate.getMonth() + 1}/${endDate.getDate()}`;
        return `${startMonthDay} ~ ${endMonthDay}`;
    }

    function updateWeekDisplay() {
        if(sessionStorage.getItem('today') === 'true') {
            currentMonth = new Date().getMonth(); // 0-based index (0 = January)
            currentYear = new Date().getFullYear();
            currentWeek = getWeekOfMonth(new Date());
        }
        const startDate = getStartDateOfWeek(currentYear, currentMonth, currentWeek);
        sessionStorage.setItem('baseDate', startDate);
//        console.log('updateWeekDisplay startDate ',startDate);
        sessionStorage.setItem('nav', '');
        selectedDate = null;
        weekDisplay.textContent = getFormattedWeekRange(startDate);
    }

    // NavigationBar 업데이트 함수
    function updateWeekDates() {
        dayDateMap.clear();
        navigationBar.innerHTML = '';
        if(sessionStorage.getItem('today') === 'true') {
            currentMonth = new Date().getMonth(); // 0-based index (0 = January)
            currentYear = new Date().getFullYear();
            currentWeek = getWeekOfMonth(new Date());
        }
        const startDate = getStartDateOfWeek(currentYear, currentMonth, currentWeek);
        const dates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            return date;
        });

        dates.forEach(date => {
            const dayIndex = (date.getDay() + 6) % 7; // Adjusting to MON = 0, ..., SUN = 6
            const dayName = categories.week[dayIndex];
            const dayDateContainer = document.createElement('div');
            dayDateContainer.className = 'nav-item'; // Use same class for styling
            dayDateContainer.dataset.date = formatDate(date);
            dayDateContainer.dataset.day = dayName;

            dayDateMap.set(dayName, formatDate(date));

            const dayElement = document.createElement('div');
            dayElement.textContent = dayName;

            const dateElement = document.createElement('div');
            dateElement.textContent = date.getDate();

            dayDateContainer.appendChild(dayElement);
            dayDateContainer.appendChild(dateElement);

            dayDateContainer.addEventListener('click', function() {
            });
            navigationBar.appendChild(dayDateContainer);
        });
    }

    function createNavItem(catName, categoryId, categoryOrDelegation) {
        const navItem = document.createElement('div');
        navItem.textContent = catName;
        navItem.className = 'nav-item';
        navItem.dataset.categoryId = categoryId;

        const editBtn = document.createElement('div');
        editBtn.textContent = '✎';
        editBtn.className = 'edit-btn';
        editBtn.addEventListener('click', async function(event) {
            event.stopPropagation();
            // Determine the message based on the category
            let promptMessage;
            if (categoryOrDelegation === 'work') {
                promptMessage = 'Edit category:';
            } else if (categoryOrDelegation === 'delegation') {
                promptMessage = 'Edit a person to delegate:';
            } else {
                promptMessage = `Edit ${category} name:`;
            }
            const newName = prompt(promptMessage, catName);
            if (newName) {
                try {
                    const categoryData = {
                        category_name: newName
                    };
                    const response = await fetch(`/api/updateCategory/${categoryId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(categoryData)
                    });

                    const data = await response.json();
                    showNotification('Category successfully updated!', 'success');
                    await populateCategories();
                    await updateNavigationBar('work');
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });

        const deleteBtn = document.createElement('div');
        deleteBtn.textContent = '✖';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', async function(event) {
            event.stopPropagation();
            if (confirm(`Delete ${catName}?`)) {
//                categories[categoryOrDelegation] = categories[categoryOrDelegation].filter(i => i !== catName);
//                updateNavigationBar(categoryOrDelegation);
                try {
                    const response = await fetch(`/api/deleteCategory/${categoryId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const data = await response.json();
                    showNotification('Category deleted.', 'delete');
                    await populateCategories();
                    await updateNavigationBar('work');
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });

        navItem.appendChild(editBtn);
        navItem.appendChild(deleteBtn);

        return navItem;
    }

    function updateNavigationBar(category) {
        navigationBar.innerHTML = '';
        if (category === 'week') {
            updateWeekDates();
            taskInputArea.style.display = 'flex';
            workInputArea.style.display = 'none';
            groupInputArea.style.display = 'none';
            routineInputArea.style.display = 'none';
        } else if (category === 'work') {
            taskInputArea.style.display = 'none';
            workInputArea.style.display = 'flex';
            groupInputArea.style.display = 'none';
            routineInputArea.style.display = 'none';
            const allButton = document.createElement('div');
            allButton.textContent = 'All';
            allButton.className = 'nav-item';
            setActiveNavItem(allButton);
            allButton.addEventListener('click', function() {
                setActiveNavItem(allButton);
                fetchTasksByWork();
            });
            navigationBar.appendChild(allButton);

            categoriesList.forEach(item => {
                const navItem = createNavItem(item.category_name, item.category_id, category);
                navItem.addEventListener('click', function() {
                    setActiveNavItem(navItem);
//                    updateContent(category, item.category_name);
                    fetchTasksByWork(item.category_id);
                });
                navigationBar.appendChild(navItem);
            });

            const addButton = document.createElement('div');
            addButton.textContent = '+';
            addButton.className = 'nav-item';
            addButton.addEventListener('click', async function() {
                let promptMessage;
                if (category === 'work') {
                    promptMessage = 'Enter a new category:';
                } else if (category === 'delegation') {
                    promptMessage = 'Enter a new person to delegate:';
                } else {
                    promptMessage = `Enter a new ${category} name:`;
                }
                const newItemName = prompt(promptMessage);

                if (newItemName) {
                    try {
                        const response = await fetch('/api/insertCategory', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json' // JSON 형식으로 설정
                            },
                            body: JSON.stringify({ category_name: newItemName }), // JSON.stringify 사용
                        });
                        await response.json();
                        showNotification('Category successfully saved!', 'success');
                        console.log('Before populateCategories:', categoriesList);
                        await populateCategories();
                        console.log('After populateCategories:', categoriesList);
                        updateNavigationBar('work'); // Now update the navigation bar with the new list
//                        clickSideBar('work', true);
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }
            });
            navigationBar.appendChild(addButton);
        } else if (category === 'routine') {
//            console.log('routine');
            taskInputArea.style.display = 'none';
            workInputArea.style.display = 'none';
            groupInputArea.style.display = 'flex';
            routineInputArea.style.display = 'flex';
        }
    }

    function setSide(category) {
        document.querySelectorAll('.side-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.side-item[data-side="${category}"]`).classList.add('active');
        updateNavigationBar(category);
        if (category === 'week') {
            updateWeekDisplay();
        }
    }

    function setActiveNavItem(activeItem) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    function clickSideBar(selectedSide, clearDetail) {
        fetchMainTaskList();
        if(clearDetail){
            sessionStorage.setItem('detailID', '');
            clearTaskDetailContent();
        }
        orderInCertainStatus = null;

        switch (selectedSide) {
            case 'week':
//                fetchTasksByDateRange(); // Call this first
                if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
                    fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
                }else{
                    fetchTasksByDay();
                }
                renderDayTitlesList(); // Ensure days list is rendered first
                showForm();
                showDone();
                break;
            case 'onhold':
            case 'delegation':
            case 'plan':
                hideForm();
                showDone();
                break;
            case 'work':
                if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
                    fetchTasksByWork(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
                }else{
                    fetchTasksByWork(sessionStorage.getItem('clickedCat'));
                }
                renderWorkTitlesList();
                showForm();
                hideDone();
                break;
            case 'routine':
//                document.querySelector('.do-dates-group').style.display = 'none';
//                taskForm.style.display = 'none';
//                daysList.style.display = 'block';
                fetchRoutines();
                showForm();
                hideDone();
                break;
            case 'completed':
                document.querySelector('.do-dates-group').style.display = 'none';
                taskForm.style.display = 'none';
                daysList.style.display = 'block';
                hideDone();
                break;
            case 'completedW':
                fetchTasksByWork(null, true);
                renderWorkTitlesList();
//                showForm();
                document.querySelector('.do-dates-group').style.display = 'none';
                taskForm.style.display = 'none';
                daysList.style.display = 'block';
                hideDone();
                break;
            default:
                showForm();
                showDone();
                break;
        }
    }

    sideList.addEventListener('click', function(event) {
        selectedSide = event.target.getAttribute('data-side');
        selectedDate = null;
//        console.log('selectedSide?? ',selectedSide);
        if (event.target.classList.contains('side-item')) {
            setSide(selectedSide);
        }
        clickSideBar(selectedSide, true);
    });

    function showForm() {
        document.querySelector('.do-dates-group').style.display = 'flex';
        taskForm.style.display = 'block';
        daysList.style.display = 'block';
    }

    function hideForm() {
        document.querySelector('.do-dates-group').style.display = 'none';
        taskForm.style.display = 'none';
        daysList.style.display = 'none';
    }

    function showDone() {
        document.querySelector('.done-group').style.display = 'flex';
    }

    function hideDone() {
        document.querySelector('.done-group').style.display = 'none';
    }

    document.getElementById('prev-week').addEventListener('click', function() {
        currentWeek--;
        if (currentWeek < 1) {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            currentWeek = getWeekOfMonth(new Date(currentYear, currentMonth + 1, 0));
        }
        updateWeekDisplay();
        if (document.querySelector('.side-item.active').getAttribute('data-side') === 'week') {
            updateWeekDates();
        }
//        sessionStorage.setItem('baseDate', baseDate);
        setSide('week'); // Default category
        clickSideBar('week', true);
//        fetchTasksByDateRange(); // Call this first
//        renderDayTitlesList(); // Ensure days list is rendered first
    });

    document.getElementById('next-week').addEventListener('click', function() {
        currentWeek++;
        const lastWeekOfMonth = Math.ceil(new Date(currentYear, currentMonth + 1, 0).getDate() / 7);
        if (currentWeek > lastWeekOfMonth) {
            currentWeek = 1;
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }
        updateWeekDisplay();
        if (document.querySelector('.side-item.active').getAttribute('data-side') === 'week') {
            updateWeekDates();
        }
//        sessionStorage.setItem('baseDate', baseDate);
        setSide('week'); // Default category
        clickSideBar('week', true);
//        fetchTasksByDateRange(); // Call this first
//        renderDayTitlesList(); // Ensure days list is rendered first
    });

    function initialize() {
        fetchMainTaskList();
        fetchTasksByDateRange(); // Call this first
//        renderDayTitlesList(); // Ensure days list is rendered first
        putWorksToSelect();
        putGroupsToSelect();
        putUsersToSelect();
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        currentWeek = getWeekOfMonth(today);
        setSide('week'); // Default category
        populateCategories(); // Call the function to populate categories on page load
        navigationBar.addEventListener('click', handleNavItemClick); // 이벤트 리스너 등록

        if(sessionStorage.getItem('nav') && sessionStorage.getItem('nav').trim() !== '') triggerNavItemClick(sessionStorage.getItem('nav'));
    }

    initialize(); // Call initialize to set up the UI

    let originalValues = { // Variables to store the original values of the inputs
        taskName: '',
        categoryName: '',
        workName: '',
        dueDate: '',
        taskMemo: '',
        taskStatus: '',
        userDelegated: '',
        taskDone: '',
        routineContent: '',
        groupContent: '',
        routineCycle: '',
        routineMonth: '',
        routineDate: '',
        routineDay: ''
    };

    function showTaskDetail(task) {
//        console.log('SHOW task detail');
        toggleDetailFields('task');
        if (task && typeof task === 'object') {
            // Update the values of the form fields with the task details
            const taskNameInput = document.getElementById('taskName');
            const categoryNameInput = document.getElementById('categoryName');
            const workNameInput = document.getElementById('workName');
            const dueDateInput = document.getElementById('dueDate');
            const taskMemoInput = document.getElementById('taskMemo');
            const taskStatusSelect = document.getElementById('taskStatus');
            const userDelegatedSelect = document.getElementById('userDelegated');
            const taskDoneSelect = document.getElementById('taskDone');
            const taskDoDate = document.getElementById('doDate');
            const mainTaskSpan = document.getElementById('mainTask');
            const mainTaskId = task.parent_task_id;

            taskNameInput.value = task.task_content || '';
            originalValues.taskName = taskNameInput.value; // Store the original value

            if(task.parent_task_id != '0') { // 서브태스크인 경우
//            console.log('sub!!! ',document.getElementById('categoryName'));
//                label.classList.toggle('disabled-label', !enable);
                sessionStorage.setItem('mainID', mainTaskId);
                subTaskMemoUpdateParentId = task.parent_task_id;
                document.querySelector('.main-task').style.display = 'flex';
                document.querySelector('.sub-tasks-group').style.display = 'none';
//                console.log("task.parent_task_id: ",task.parent_task_id);

                fetch(`/api/findTaskContent/${mainTaskId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.task_content) {
                            mainTaskSpan.innerText = data.task_content;

                            // mainTaskId를 클로저로 고정한 handleClick 선언
                            const handleClick = () => {
                                if(sessionStorage.getItem('mainID') != '0'){
//                                    console.log('mainTaskSpan ID:', sessionStorage.getItem('mainID')); // 여기서는 mainTaskId는 변하지 않음
                                    sessionStorage.setItem('detailID', sessionStorage.getItem('mainID'));
                                    fetchTaskDetails();
                                    sessionStorage.setItem('mainID', '0');
                                }
                            };
                            // 기존 이벤트 리스너를 제거 후 새로 등록
                            mainTaskSpan.removeEventListener('click', handleClick); // 기존 리스너 제거
                            if (!mainTaskSpan.dataset.clickHandlerRegistered) {
                                mainTaskSpan.addEventListener('click', handleClick); // 새로운 리스너 등록
                                mainTaskSpan.dataset.clickHandlerRegistered = 'true'; // 등록된 상태 저장
                            }

                            // 서브태스크는 category, work 지정 불가.
                            document.getElementById('categoryName').disabled = true;
                            document.getElementById('workName').disabled = true;
                            document.querySelector('label[for="categoryName"]').classList.toggle('disabled-label', true);
                            document.getElementById('workNameLabel').classList.toggle('disabled-label', true);
                        } else {
                            mainTaskSpan.innerText = '';
                            console.error('Task content not found for taskId:', taskId);
                        }
                    })
                    .catch(error => console.error('Error fetching task details:', error));
            } else { // 메인태스크인 경우
//            console.log('main!!! ',mainTaskId);
                sessionStorage.setItem('mainID', '0');
                subTaskMemoUpdateParentId = false;
                document.querySelector('.main-task').style.display = 'none';
                document.querySelector('.sub-tasks-group').style.display = 'flex';
                mainTaskSpan.innerHTML = '';
            }

            categoryNameInput.value = task.category_id;
            originalValues.categoryName = categoryNameInput.value; // Store the original value

            //workNameInput.value = task.work_name || '';
            workNameInput.value = task.work_id;
            originalValues.workName = workNameInput.value; // Store the original value

            dueDateInput.value = task.due_date || '';
            originalValues.dueDate = dueDateInput.value; // Store the original value

            taskMemoInput.value = task.task_memo || '';
            originalValues.taskMemo = taskMemoInput.value; // Store the original value
            taskMemoInput.style.height = "auto"; // Reset height to auto to recalculate
            taskMemoInput.style.height = taskMemoContent.scrollHeight + "px"; // Set height based on the scrollHeight

            // Convert do_dates string to an array
            doDatesArray = task.do_dates ? task.do_dates.split(',') : [];
            populateDoDates(doDatesArray);

            let subTasksArray = task.sub_tasks ? task.sub_tasks.split(',') : [];
            if (subTasksArray.length > 0) {
                populateSubTasks(subTasksArray, task.is_assigned_to_me == '1');
            } else {
                subTasksContainer.innerHTML = ''; // Clear existing sub-tasks
            }

            taskStatusSelect.value = task.task_status || '';
            originalValues.taskStatus = taskStatusSelect.value; // Store the original value

            userDelegatedSelect.value = task.assignee_id;
            originalValues.userDelegated = userDelegatedSelect.value; // Store the original value

            taskDoDate.value = task.ori_do_date || '';
            taskDoDate.innerText = task.do_date ? '(' + task.do_date + ')' : '';  // p 태그의 텍스트를 do_date 값으로 설정
            taskDoneSelect.value = task.task_done || '';
            originalValues.taskDone = taskDoneSelect.value; // Store the original value

            categoryNameInput.removeEventListener('change', handleDetailChange);
            taskNameInput.removeEventListener('change', handleDetailChange);
            workNameInput.removeEventListener('change', handleDetailChange);
            dueDateInput.removeEventListener('change', handleDetailChange);
            taskMemoInput.removeEventListener('change', handleDetailChange);
            taskStatusSelect.removeEventListener('change', handleDetailChange);
            userDelegatedSelect.removeEventListener('change', handleDetailChange);
            taskDoneSelect.removeEventListener('change', handleDetailChange);

            taskNameInput.addEventListener('change', handleDetailChange);
            categoryNameInput.addEventListener('change', handleDetailChange);
            workNameInput.addEventListener('change', handleDetailChange);
            dueDateInput.addEventListener('change', handleDetailChange);
            taskMemoInput.addEventListener('change', handleDetailChange);
            taskStatusSelect.addEventListener('change', handleDetailChange);
            userDelegatedSelect.addEventListener('change', handleDetailChange);
            taskDoneSelect.addEventListener('change', handleDetailChange);

            if(task.is_assigned_to_me == '1'){
                disableTaskDetailFields();
            } else {
                enableTaskDetailFields();
            }

            // 현재 함수 내에서만 이벤트 리스너를 설정하고 싶을 때
            const deleteButton = document.getElementById('deleteConfirmationButton');

            // 기존 이벤트 리스너를 임시로 제거
            const oldClickHandler = deleteButton.onclick;

            // 새로운 클릭 이벤트 리스너 추가
            deleteButton.onclick = (event) => {
                event.preventDefault(); // Prevent default form submission
                deleteConfirmationModal.style.display = 'block';
//                console.log('Temporary delete button click handler for work detail');
            };
        } else {
            console.error('Invalid task object:', task);
        }
    }

    function showWorkDetail(work) {
        toggleDetailFields('work');
//        if(work.work_status == 2) enableDetailByStatus(false);
//        else enableDetailByStatus(true);

        if (work && typeof work === 'object') {
            const categoryNameInput = document.getElementById('categoryName');
            const workNameInput = document.getElementById('workNameInput');
            const workStatusSelect = document.getElementById('workStatus');

            categoryNameInput.value = work.category_id || '';
            originalValues.categoryName = categoryNameInput.value; // Store the original value

            workNameInput.value = work.work_name;
            originalValues.workNameInput = workNameInput.value; // Store the original value

            workStatusSelect.value = work.work_status || '';
            originalValues.workStatus = workStatusSelect.value; // Store the original value

            categoryNameInput.removeEventListener('change', handleDetailChange);
            workNameInput.removeEventListener('change', handleDetailChange);
            workStatusSelect.removeEventListener('change', handleDetailChange);

            categoryNameInput.addEventListener('change',    handleWorkDetailChange);
            workNameInput.addEventListener('change',        handleWorkDetailChange);
            workStatusSelect.addEventListener('change',     handleWorkDetailChange);

            // 현재 함수 내에서만 이벤트 리스너를 설정하고 싶을 때
            const deleteButton = document.getElementById('deleteConfirmationButton');

            // 기존 이벤트 리스너를 임시로 제거
            const oldClickHandler = deleteButton.onclick;

            // 새로운 클릭 이벤트 리스너 추가
            deleteButton.onclick = (event) => {
                event.preventDefault(); // Prevent default form submission
                deleteConfirmationModalWork.style.display = 'block';
                document.getElementById('confirmDeleteButtonWork').setAttribute('data-work-id', work.work_id);
                console.log('Temporary delete button click handler for work detail');
            };

            if(work.work_status == 1) {

            } else {
            }
        } else {
            console.error('Invalid work object:', work);
        }
    }

    function showRoutineDetail(work) {
        toggleDetailFields('routine');
//        if(work.work_status == 2) enableDetailByStatus(false);
//        else enableDetailByStatus(true);

        if (work && typeof work === 'object') {
            const routineContentInput = document.getElementById('routineContent');
            const groupContentInput = document.getElementById('groupContent');
            const routineCycleSelect = document.getElementById('routineCycle');
            const routineMonthSelect = document.getElementById('routineMonth');
            const routineDaySelect = document.getElementById('routineDay');
            const routineDateSelect = document.getElementById('routineDate');

            routineContentInput.value = work.routine_content;
            originalValues.routineContent = routineContentInput.value; // Store the original value

            groupContentInput.value = work.routine_group;
            originalValues.groupContent = groupContentInput.value; // Store the original value

            routineCycleSelect.value = work.repetition_cycle || '';
            originalValues.routineCycle = routineCycleSelect.value; // Store the original value

            routineDaySelect.style.display = 'none';
            routineDateSelect.style.display = 'none';
            routineMonthSelect.style.display = 'none';
            routineDayGroup.style.display = 'flex';
            switch(work.repetition_cycle){
                case 'day':
            routineDayGroup.style.display = 'none';
//                    routineDaySelect.style.display = 'flex';
//                    routineDaySelect.innerHTML = '<option value="everyday">Every day</option>';
                    break;
                case 'week':
//                    console.log('week-',work.routine_day);
                    routineDaySelect.style.display = 'flex';
                    routineDaySelect.value = work.routine_day || '';
                    originalValues.routineDay = routineDaySelect.value;
                    break;
                case 'month':
                    routineDateSelect.style.display = 'flex';
                    routineDateSelect.value = work.routine_date || '';
                    originalValues.routineDay = routineDateSelect.value;
                    break;
                case 'year':
                    console.log('year-',work.routine_month,',',work.routine_date_of_month);
                    routineMonthSelect.style.display = 'flex';
                    routineDateSelect.style.display = 'flex';
                    routineMonthSelect.value = work.routine_month || '';
                    routineDateSelect.value = work.routine_date_of_month || '';
                    originalValues.routineDay = work.routine_month + '-' + work.routine_date_of_month;
                    break;
            }

            routineContentInput.removeEventListener('change', handleDetailChange);
            groupContentInput.removeEventListener('change', handleDetailChange);
            routineCycleSelect.removeEventListener('change', handleDetailChange);
            routineMonthSelect.removeEventListener('change', handleDetailChange);
            routineDaySelect.removeEventListener('change', handleDetailChange);
            routineDateSelect.removeEventListener('change', handleDetailChange);

            routineContentInput.addEventListener('change', handleDetailChange);
            groupContentInput.addEventListener('change', handleDetailChange);
            routineCycleSelect.addEventListener('change', handleDetailChange);
            routineMonthSelect.addEventListener('change', handleDetailChange);
            routineDaySelect.addEventListener('change', handleDetailChange);
            routineDateSelect.addEventListener('change', handleDetailChange);

            // 현재 함수 내에서만 이벤트 리스너를 설정하고 싶을 때
            const deleteButton = document.getElementById('deleteConfirmationButton');

            // 기존 이벤트 리스너를 임시로 제거
            const oldClickHandler = deleteButton.onclick;

            // 새로운 클릭 이벤트 리스너 추가
            deleteButton.onclick = (event) => {
                event.preventDefault(); // Prevent default form submission
                deleteConfirmationModalR.style.display = 'block';
                document.getElementById('confirmDeleteButtonR').setAttribute('data-routine-id', work.routine_id);
//                console.log('Temporary delete button click handler for work detail');
            };
        } else {
            console.error('Invalid work object:', work);
        }
    }

    function toggleDetailFields(situation) {
        // 필드 목록 정의 (상황에 따라 표시할 필드 목록)
        const essentialFields = {
            work: ['workNameInput', 'categoryName', 'workStatus'],
            task: ['taskName', 'workName', 'dueDate', 'taskStatus', 'doDates', 'doDatesContainer', 'subTasks', 'taskMemo', 'taskMemoInput', 'taskDone', 'categoryName'],
            routine: ['routineContent', 'routineCycle', 'routineDay', 'routineDateSelects', 'groupContent']
        };

        // 모든 input-group 요소 선택
        const allInputGroups = document.querySelectorAll('.input-group');
        const titleElement = document.querySelector('.task-detail h3'); // 제목 요소 선택

        // 각 input-group 요소를 순회하면서 표시할 필드 조정
        allInputGroups.forEach(group => {
            const fieldId = group.querySelector('input, select, textarea, div')?.id;

            // 상황에 맞는 필드를 표시
            if (situation === 'work' && essentialFields.work.includes(fieldId)) {
                group.style.display = 'flex'; // work 상황에서 필드 표시
            } else if (situation === 'task' && essentialFields.task.includes(fieldId)) {
                group.style.display = 'flex'; // task 상황에서 필드 표시
            } else if (situation === 'routine' && essentialFields.routine.includes(fieldId)) {
//                console.log(",",fieldId);
                group.style.display = 'flex'; // routine 상황에서 필드 표시
            } else {
                group.style.display = 'none'; // 그 외의 필드는 숨김
            }
        });

        if (situation === 'work') {
            titleElement.textContent = '[ Work Detail ]';  // work 상황일 때 제목 수정
        } else if (situation === 'task') {
            titleElement.textContent = '[ Task Detail ]';  // task 상황일 때 제목 수정
        } else if (situation === 'routine') {
            titleElement.textContent = '[ Routine Detail ]';  // routine 상황일 때 제목 수정
        }
    }

    function handleDetailChange(event) {
        let id = event.target.id;
        let currentValue;

        switch (id) {
            case 'taskName':
            case 'workName': // task detail에서 select로 수정하는 경우
//            case 'workNameInput': // work detail에서 input으로 수정하는 경우
            case 'dueDate':
                currentValue = event.target.value;
                if (currentValue !== originalValues[id]) {
//                    console.log('handleDetailChange~ currentValue: ',currentValue==null,' originalValues[id]: ', originalValues[id]);
                    updateTask(id);
//                    saveChangesButton.click();
                }
                break;
            case 'categoryName':
                currentValue = event.target.value;
                if (currentValue !== originalValues[id]) {
                    if(document.getElementById('workName').value != null && document.getElementById('workName').value != ''){
                        showNotification('Remove the work first!', 'error');
                        fetchTaskDetails(sessionStorage.getItem('detailDoDate'));
                        return;
                    }
                    console.log('handleDetailChange~ currentValue: ',currentValue==null,' originalValues[id]: ', originalValues[id]);
                    updateTask(id);
                }
                break;
            case 'taskMemo':
                if (subTaskMemoUpdateParentId) {
                    subTaskMemoUpdateSubId = sessionStorage.getItem('detailID');
                    sessionStorage.setItem('detailID', subTaskMemoUpdateParentId);
                    subTaskMemoUpdateParentId = false;
                }
                memoChange();
                break;
            case 'taskDone':
                currentValue = event.target.value;
                if (currentValue !== originalValues[id]) {
//                    console.log('doneO currentValue: ',currentValue,' originalValues[id]: ', originalValues[id]);
                    updateDoDateTaskDone(null, true);
                }
                break;
            case 'taskStatus':
                currentValue = event.target.value;
                console.log('case taskStatus currentValue:',currentValue,'/originalValues[id]:',originalValues[id]);
                if (currentValue !== originalValues[id]) {
                    if((originalValues[id] == 4 || originalValues[id] == 5 || originalValues[id] == 6)
                        && (currentValue == 0 || currentValue == 1 || currentValue == 2 || currentValue == 3)) {
                        document.querySelector('.do-dates-group').style.display = 'flex';
                        if(currentValue == 2){
                            updateOrderAndDoDate(null, new Date().toISOString().split('T')[0], null, null, sessionStorage.getItem('detailID'), currentValue, "2");
                        } else {
                            updateOrderAndDoDate(null, '9999-12-31', null, null, sessionStorage.getItem('detailID'), currentValue, null);
                        }

                    } else if((originalValues[id] != 4 && originalValues[id] != 5 && originalValues[id] != 6)
                        && currentValue == 2 && doDatesArray.length === 0){
                        updateOrderAndDoDate(null, new Date().toISOString().split('T')[0], null, null, sessionStorage.getItem('detailID'), currentValue, "2");
                    } else if(currentValue == 4) {
                        document.querySelector('.do-dates-group').style.display = 'none';
                        updateDoDates(sessionStorage.getItem('detailID'), '9999-01-04', currentValue);
                    } else if(currentValue == 5) {
                        document.querySelector('.do-dates-group').style.display = 'none';
                        updateDoDates(sessionStorage.getItem('detailID'), '9999-01-05', currentValue);
                    } else if(currentValue == 6) {
                        document.querySelector('.do-dates-group').style.display = 'none';
                        updateDoDates(sessionStorage.getItem('detailID'), '9999-01-06', currentValue);
                    } else {
                        updateTask(id);
                    }
                    if (originalValues[id] == 2){
                        updateDoDateTaskDone('Undone',false);
                    }
                }
                break;
            case 'userDelegated':
//                currentValue = event.target.value;
                delegationChange();
                break;
            case 'routineContent':
            case 'routineCycle':
            case 'routineDay':
                currentValue = event.target.value;
//                console.log(originalValues[id],'->',currentValue);
                if (currentValue !== originalValues[id]) {
                    updateRoutine(id);
                }
                break;
            case 'groupContent':
                currentValue = event.target.value;
                if(currentValue == null || currentValue == ''){
                    document.getElementById('groupContent').value = originalValues[id];
                    showNotification('A routine should have a group', 'error');
                    return;
                }
                if (currentValue !== originalValues[id]) {
                    updateRoutine(id);
                }
                break;
            case 'routineMonth':
            case 'routineDate':
                    currentValue = event.target.value;
                if(document.getElementById('routineCycle').value == 'year'){
                    if(document.getElementById('routineMonth').value != '' && document.getElementById('routineDate').value != ''){
//                        console.log('1먼스,데이트 둘다 있음............');
                        id = 'routineForYear';
                        currentValue = document.getElementById('routineMonth').value + '-' + document.getElementById('routineDate').value;
                    } else {
//                        console.log('2............');
                        return;
                    }
                }
                console.log(originalValues[id],'->',currentValue);
                if (currentValue !== originalValues[id]) {
                    updateRoutine(id);
                }
                break;
        }
    }

    async function handleWorkDetailChange(event) {
        const id = event.target.id;
        let currentValue;

        switch (id) {
            case 'categoryName':
//            case 'workName': // task detail에서 select로 수정하는 경우
            case 'workNameInput': // work detail에서 input으로 수정하는 경우
                currentValue = event.target.value;
                if (currentValue !== originalValues[id]) {
//                    console.log('handleWorkDetailChange! currentValue: ',currentValue,' originalValues[id]: ', originalValues[id]);
                    saveWork(sessionStorage.getItem('detailWorkID'), null);
                }
                break;
            case 'workStatus':
                currentValue = event.target.value;
                if (currentValue !== originalValues[id]) {
//                    console.log('handleWorkDetailChange! currentValue: ',currentValue,' originalValues[id]: ', originalValues[id]);
                    if(currentValue == 2) {
                        const isCompleted = await isEveryTaskCompleted(sessionStorage.getItem('detailWorkID'));
                        if(!isCompleted) {
                            showNotification('Uncompleted tasks remained!', 'error');
                            fetchWorkDetails();
                            return;
                        }
                    }
                    saveWork(sessionStorage.getItem('detailWorkID'), null);
                }
                break;
            default:
                break;
        }
    }
    async function isEveryTaskCompleted(id) {
        const workId = id;
        try {
            const response = await fetch(`/api/isEveryTaskCompleted/${workId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // API 결과 처리 (true or false)
            return data; // 서버에서 받은 데이터가 true/false로 반환된다고 가정
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            return false; // 오류 발생 시 기본적으로 false 반환
        }
    }

    function toggleTaskDetailFields(enable) {
        // 각 필드의 ID 목록 정의
        const fieldIds = [
            'taskName', 'categoryName', 'workName', 'dueDate', 'taskStatus',
            'userDelegated', 'doDate', 'mainTask'
        ];
        const subTaskGroups = document.querySelectorAll('.new-sub-task');

        // 필드 활성화/비활성화 설정
        fieldIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.disabled = !enable;
        });

        // sub-task 그룹 활성화/비활성화 설정 및 레이블 색상 조정
        subTaskGroups.forEach(group => {
            group.style.pointerEvents = enable ? 'auto' : 'none';
            group.classList.toggle('disabled-label', !enable);
        });

        // 레이블 스타일 변경 (taskMemo와 taskDone 제외)
        const labels = document.querySelectorAll('.input-group label');
        labels.forEach(label => {
            const labelFor = label.getAttribute('for');
            if (labelFor !== 'taskMemo' && labelFor !== 'taskDone') {
                label.classList.toggle('disabled-label', !enable);
            }
        });

        // span 요소들에 대해서도 class 변경 처리
        const spans1 = document.querySelectorAll('.input-group span');
        const spans2 = document.querySelectorAll('.new-sub-task span');

        spans1.forEach(span => {
            span.classList.toggle('disabled-label', !enable);
        });
        spans2.forEach(span => {
            span.classList.toggle('disabled-label', !enable);
        });
        addSubTaskButton.style.display = enable ? 'block' : 'none';
        deleteConfirmationButton.style.display = enable ? 'block' : 'none';

        // Sub-task와 Main-task 클릭 가능 여부 설정
        document.querySelector('.main-task').style.pointerEvents = enable ? 'auto' : 'none';
        document.querySelector('.sub-tasks-group').style.pointerEvents = enable ? 'auto' : 'none';
    }

    function disableTaskDetailFields() {
        toggleTaskDetailFields(false);
    }

    function enableTaskDetailFields() {
        toggleTaskDetailFields(true);
    }
    function enableDetailByStatus(enable) {
    console.log('enableDetailByStatus');
        // 모든 input, select, textarea, button 요소를 가져옴
        const inputs = document.querySelectorAll('#taskDetailContent input, #taskDetailContent select, #taskDetailContent textarea, #taskDetailContent button');

        // taskStatus와 workStatus를 제외한 나머지 요소에 대해 활성화 또는 비활성화 설정
        inputs.forEach(input => {
            if (input.id !== 'taskStatus' && input.id !== 'workStatus') {
                input.disabled = !enable; // 비활성화 시 true, 활성화 시 false
                input.style.backgroundColor = enable ? '' : '#f0f0f0'; // 활성화 시 원래 색상으로, 비활성화 시 회색
            }
        });

        // Delete 버튼 설정
        document.getElementById('deleteConfirmationButton').disabled = !enable;

        // 레이블 스타일 변경 (taskStatus와 workStatus 제외)
        const labels = document.querySelectorAll('.input-group label');
        labels.forEach(label => {
            const labelFor = label.getAttribute('for');
            if (labelFor !== 'taskStatus' && labelFor !== 'workStatus') {
                label.classList.toggle('disabled-label', !enable); // 활성화 시 클래스 제거, 비활성화 시 클래스 추가
            }
        });
    }

    assignedToMeList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li.task-item');
        if (listItem) {
            const taskId = listItem.getAttribute('data-task-id');
            sessionStorage.setItem('detailID', taskId);
            sessionStorage.setItem('detailDoDate', listItem.getAttribute('data-task-dodate'));
            fetchTaskDetails(listItem.getAttribute('data-task-dodate'));
        }
    });

    taskList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li.task-item');
        if (listItem) {
            const taskId = listItem.getAttribute('data-task-id');
            sessionStorage.setItem('detailID', taskId);
            sessionStorage.setItem('detailDoDate', listItem.getAttribute('data-task-dodate'));
            fetchTaskDetails(listItem.getAttribute('data-task-dodate'));
        }
    });

    daysList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li.task-item');
        if (listItem) {
            const taskId = listItem.getAttribute('data-task-id');
            sessionStorage.setItem('detailID', taskId);
            sessionStorage.setItem('detailDoDate', listItem.getAttribute('data-task-dodate'));

            const routineGroupId = listItem.getAttribute('data-routine-id');
//            console.log('1//taskId: ',taskId,', routineGroupId: ',routineGroupId);

            if(taskId != null && taskId != 'null' && taskId != undefined) {
//                console.log('daysList detailID: '+sessionStorage.getItem('detailID'));
                fetchTaskDetails(listItem.getAttribute('data-task-dodate'));
                return;
            } else if(routineGroupId != null && routineGroupId != 'null' && routineGroupId != undefined){
                sessionStorage.setItem('detailRoutineID', routineGroupId);
                fetchRoutineDetails();
                return;
            }
        }
        const workListItem = event.target.closest('li.work-item');
        if (workListItem) {
            const workId = workListItem.getAttribute('data-work-id');
            const routineGroupId = workListItem.getAttribute('data-group-id');
            console.log('1//workId: ',workId,', routineGroupId: ',routineGroupId);
            if(workId != null && workId != 'null' && workId != undefined) {
                if (workId.includes('-')) return;
                else {
                    sessionStorage.setItem('detailWorkID', workId);
                    fetchWorkDetails();
                    return;
                }
            }
            if(routineGroupId != null && routineGroupId != 'null' && routineGroupId != undefined){
                return;
            }

        }
    });

    function updateDoDates(id, dates, status) {
//        console.log("0 id: ",id,'/dates:',dates,'/status:',status);
        const taskId = id ? id : sessionStorage.getItem('detailID');
        const datesString = dates ? dates : getDatesString();
        const taskStatus = status ? status : "";
        const updateData = {
            task_id: taskId,
            do_dates: datesString,
            task_status: taskStatus
        };
//        console.log("1 taskId: ",taskId,'/datesString:',datesString,'/taskStatus:',taskStatus);
        sessionStorage.setItem('detailID', taskId);

        const datesArray = datesString.split(',');  // Convert the datesString back to an array
        const lastDate = datesArray[datesArray.length - 1];  // Get the last date

        fetch('/api/updateDoDates', { // API 호출
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(data => {
//            console.log('Success:', data);
            if(dates == null || dates == '') {
                showNotification('Do dates successfully updated!', 'success');
            }
            fetchTaskDetails(lastDate); // 태스크 상세정보 갱신
//            fetchMainTaskList(); // 메인 태스크 리스트 갱신
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }


    function deleteDetailDoDate(taskId, doDate) {
//        const lastDate = datesArray[datesArray.length - 1];  // Get the last date
        console.log('taskId:',taskId,',doDate:',doDate);
        fetch(`/api/deleteDetailDoDate/${taskId}?doDate=${doDate}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            showNotification('Dodate deleted.', 'delete');
            const datesArray = getDatesString().split(',');  // Convert the datesString back to an array
            if (!datesArray || datesArray.length === 0 ||datesArray[0] == '') {
                fetchTaskDetails(); // 태스크 상세정보 갱신
            } else {
                fetchTaskDetails(datesArray[datesArray.length - 1]); // 태스크 상세정보 갱신
            }
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    async function updateDetailDoDate(id, oldDate, newDate) {
        const updateData = {
            task_id: id,
            old_do_date: oldDate,
            new_do_date: newDate
        };
        const isDuplicate = await isDuplicateOnSameDate(newDate, id);
        if(isDuplicate) {
            showNotification('Same task exists on the same day', 'error');
            fetchTaskDetails(sessionStorage.getItem('detailDoDate'));
            return;
        }
        console.log("! ",id, oldDate, newDate);
        sessionStorage.setItem('detailID', id);
        fetch('/api/updateDetailDoDate', { // API 호출
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Do dates successfully updated!', 'success');
            fetchTaskDetails(newDate); // 태스크 상세정보 갱신
            sessionStorage.setItem('detailDoDate', newDate);
//            fetchMainTaskList(); // 메인 태스크 리스트 갱신
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function updateOrderAndDoDate(fromDay, toDay, oldIndex, newIndex, movedTaskId, newStatus, newDone) {
        const updateData = {
            task_id: movedTaskId,
            old_do_date: fromDay,
            new_do_date: toDay,
            old_idx: oldIndex,
            new_idx: newIndex,
            task_status: newStatus,
            task_done: newDone
        };
//        console.log('movedTaskId: ',movedTaskId);
        sessionStorage.setItem('detailID', movedTaskId);

        fetch('/api/updateOrderAndDoDate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(data => {
//            console.log('Task updated successfully:', data);
            showNotification('Successfully updated!', 'success');
//            if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
//                fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
//            }else{
//                fetchTasksByDay();
//            }
//            fetchMainTaskList();
            fetchTaskDetails(toDay);
            clickSideBar(selectedSide, false);
        })
        .catch(error => console.error('Error updating task:', error));
    }

    // Initialize Sortable.js for a given task list element
    async function initSortable(taskListElement) {
        new Sortable(taskListElement, {
            group: 'shared',
            animation: 150,
            filter: '.empty-placeholder', // .empty-placeholder를 제외한 항목만 드래그할 수 있게 함
            handle: '.hamburger-icon', // Only allow dragging by the hamburger icon
            onStart: function (evt) {
                // 드래그 시작 시 복사본을 원래 위치에 저장
                evt.item.dataset.oldIndex = evt.oldIndex;
                evt.item.dataset.oldParent = evt.from.id;
            },
            onEnd: async function (evt) {  // onEnd 함수도 비동기로 선언
                const fromId = evt.from.id;
                const toId = evt.to.id;
                let fromDay;
                let toDay;

                if(selectedSide == 'work') {
//                    showNotification('Tasks in Work Menu cannot be moved!', 'error');
//                    clickSideBar('work');
//                    return;
                }
                if(orderInCertainStatus !== undefined && orderInCertainStatus !== null){
                    if(orderInCertainStatus == 2) {
                        showNotification('A completed task cannot be moved!', 'error');
                        console.log('orderInCertainStatus!=null orderInCertainStatus == 2!! return');
                        fetchCompletedTasks();
                        return;
                    }
                    console.log('orderInCertainStatus!=null >',orderInCertainStatus);
                    fromDay = orderInCertainStatus;
                    toDay = orderInCertainStatus;
                    orderInCertainStatus = null;
                } else {
                    fromDay = fromId === 'taskList' ? 'NOTASSIGNED' : (fromId ? dayDateMap.get(fromId.replace('Tasks', '')) : 'NOTASSIGNED');
                    toDay = toId === 'taskList' ? 'NOTASSIGNED' : (toId ? dayDateMap.get(toId.replace('Tasks', '')) : 'NOTASSIGNED');
                }

                const taskList = Array.from(evt.from.children).map(child => {
                    return {
                        task_id: child.getAttribute('data-task-id'),
                        task_order: parseInt(child.getAttribute('data-task-order'))
                    };
                });

                const movedTaskId = evt.item.getAttribute('data-task-id');  // The task ID of the moved task
//                const movedTaskDodate = evt.item.getAttribute('ata-task-dodate');
                const newIndex = evt.newIndex;
                const oldIndex = evt.oldIndex;

                if(fromDay == toDay && oldIndex == newIndex) return;
                const isDuplicate = await isDuplicateOnSameDate(toDay, movedTaskId);
                if(fromDay != toDay && isDuplicate) {

                    // 드래그한 아이템을 원래 위치로 되돌리기
                    const oldParent = document.getElementById(evt.item.dataset.oldParent);
                    const oldIndex = evt.item.dataset.oldIndex;
                    oldParent.insertBefore(evt.item, oldParent.children[oldIndex]);
                    showNotification('Same task exists on the same day', 'error');
                    return;
                }
                console.log('fromDay:', fromDay, '/toDay:', toDay,'/oldIndex:',oldIndex, '/newIndex:',newIndex,'/movedTaskId:',movedTaskId);
                await updateOrderAndDoDate(fromDay, toDay, oldIndex, newIndex, movedTaskId, null);
            }
        });
    }
    async function isDuplicateOnSameDate(day, id) {
        const taskId = id;
        const doDate = day;

        try {
            const response = await fetch(`/api/isDuplicateOnSameDate/${taskId}?doDate=${doDate}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // API 결과 처리 (true or false)
            return data; // 서버에서 받은 데이터가 true/false로 반환된다고 가정
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            return false; // 오류 발생 시 기본적으로 false 반환
        }
    }

    function renderDayTasksList(day) {
        const taskListForDay = document.getElementById(`${day}Tasks`);
        if (!taskListForDay) {
            console.error(`No element found with ID: ${day}Tasks`);
            return;
        }
        taskListForDay.innerHTML = '';

        if (tasksByDay[day] && tasksByDay[day].length > 0) {
            tasksByDay[day].forEach((task, index) => {
                const taskItem = createTaskItem(task, true, true);
                    if(task.is_overdue == '1'){
                        taskItem.id = 'overdue';
                    }
                taskListForDay.appendChild(taskItem);
            });
        } else taskListForDay.appendChild(addPlaceholderForEmptyList());
        initSortable(taskListForDay, null);
    }

    function renderWorkTasksList(workId) {
        const workName = tasksByWork[workId].work_name;
        const taskListForWork = document.getElementById(`${workId}Tasks`);
        if (!taskListForWork) {
            console.error(`No element found with ID: ${workId}Tasks`);
            return;
        }

        taskListForWork.innerHTML = '';

        // tasksByWork[workName]에서 tasks 배열을 가져와 작업을 렌더링
        const tasksForWork = tasksByWork[workId]?.tasks || [];
        if (tasksForWork.length > 0) {
            // task_id가 null이 아닌 task들만 필터링
            const filteredTasks = tasksForWork.filter(task => task.task_id !== null);

            if (filteredTasks.length > 0) {
                filteredTasks.forEach((task, index) => {
                    // 각 task를 렌더링
                    const taskItem = createTaskItem(task, false, false);
                    if(task.is_overdue == '1'){
                        taskItem.id = 'overdue';
                    }
                    taskListForWork.appendChild(taskItem);
                });
            } else taskListForWork.appendChild(addPlaceholderForEmptyList());
        } else taskListForWork.appendChild(addPlaceholderForEmptyList());

        initSortable(taskListForWork, null);  // 업데이트된 작업 목록에 대해 Sortable.js 초기화
    }

    function renderRoutinesList(group) {
        const taskListForWork = document.getElementById(`${group}Tasks`);
        if (!taskListForWork) {
            console.error(`No element found with ID: ${group}Tasks`);
            return;
        }

        taskListForWork.innerHTML = '';

        // tasksByWork[group]에서 tasks 배열을 가져와 작업을 렌더링
        const tasksForWork = tasksByWork[group]?.tasks || [];
        if (tasksForWork.length > 0) {
            // task_id가 null이 아닌 task들만 필터링
            const filteredTasks = tasksForWork.filter(task => task.routine_id !== null);

            if (filteredTasks.length > 0) {
                filteredTasks.forEach((task, index) => {
                    // 각 task를 렌더링
                    const taskItem = createRoutineItem(task);
                    taskListForWork.appendChild(taskItem);
                });
            } else taskListForWork.appendChild(addPlaceholderForEmptyList());
        } else taskListForWork.appendChild(addPlaceholderForEmptyList());

        initSortable(taskListForWork, null);  // 업데이트된 작업 목록에 대해 Sortable.js 초기화
    }

    function fetchMainTaskList() {
        taskList.innerHTML = ''; // Clear existing tasks
        assignedToMeList.innerHTML = ''; // Clear existing tasks
        createTaskItem.innerHTML = ''; // Clear existing tasks
        assignedToMeList.style.display = 'none';

        switch (selectedSide) {
            case 'week':
                fetch('/api/tasksNotAssigned')
                    .then(response => response.json())
                    .then(data => {
                        if (data.length === 0) taskList.appendChild(addPlaceholderForEmptyList());
                        else {
                            data.forEach(task => {
                                const taskItem = createTaskItem(task, true, true);
                                if(task.is_overdue == '1'){
                                    taskItem.id = 'overdue';
                                }
                                taskList.appendChild(taskItem);
                            });
                        }
                        initSortable(taskList); // Use 'NOTASSIGNED' or any placeholder if needed
                    })
                    .catch(error => console.error('Error fetching tasks:', error));

                fetch('/api/findAssignedToMe')
                    .then(response => response.json())
                    .then(data => {
                        if (data.length === 0) {
                            assignedToMeList.style.display = 'none';
                            return;
                        } else {
                            assignedToMeList.style.display = 'block';
                            const li = document.createElement('li');
                            li.innerHTML = '<strong>[[ </string><strong class="custom-day-font">Delegated to me</strong><strong> ]]</strong>';
                            assignedToMeList.appendChild(li);
                            data.forEach(task => {
                                const taskItem = createTaskItem(task, false, true);
                                if(task.is_overdue == '1'){
                                    taskItem.id = 'overdue';
                                }
                                    taskItem.id = 'assigned';
                                assignedToMeList.appendChild(taskItem);
                            });
                        }
//                        initSortable(assignedToMeList); // Use 'NOTASSIGNED' or any placeholder if needed
                    })
                    .catch(error => console.error('Error fetching tasks:', error));
                break;
            case 'onhold':
            case 'delegation':
            case 'plan':
                fetchStatus(statusMap[selectedSide]);
                break;
            case 'completed':
                fetchCompletedTasks();
                break;
//            case 'completedW':
//                fetchTasksByWork();
//                break;
            case 'delegation':
            case 'work':
//                console.log("fetchMainTaskList");
//                fetchTasksByWork();
                putWorksToSelect();
                break;
            case 'routine':
//                putGroupsToSelect();
                break;
            default:
                break;
        }
    }

    function fetchTaskDetails(pDoDate) {
        enableTaskDetailContent();
        addSubTaskButton.disabled = false;
        addDateButton.disabled = false;
        const taskId = sessionStorage.getItem('detailID');
        var doDate = null;
//        console.log("pDoDate: ",pDoDate);
        if(pDoDate !== null && pDoDate !== ''){
            doDate = pDoDate === 'NOTASSIGNED' ? '9999-12-31' : pDoDate;
        }

        if (!taskId) {
            clearTaskDetailContent();
            return; // 값이 없으므로 함수를 종료
        }

        fetch(`/api/findById/${taskId}?doDate=${doDate}`)
//        fetch(`/api/findById/${taskId}`)
            .then(response => {
//                console.log('Response status:', response.status); // 상태 코드 출력
                return response.text(); // 응답을 텍스트로 변환
            })
            .then(text => {
//                console.log('Response text:', text); // 응답 내용 출력
                if (text) {
                    try {
                        const data = JSON.parse(text); // Parse text as JSON
                        putWorksToSelect(data.category_id, data.work_id);
                        showTaskDetail(data);
                        if(data.task_status == 4 ||data.task_status == 5 ||data.task_status == 6){
                            document.querySelector('.do-dates-group').style.display = 'none';
                        } else {
                            document.querySelector('.do-dates-group').style.display = 'flex';
                        }
                        if(data.task_status == 5){
                            document.querySelector('.input-group.delegation').style.display = 'flex';
//                            putUsersToSelect();
                        } else {
                            document.querySelector('.input-group.delegation').style.display = 'none';
                        }
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                } else {
                    console.error('Empty response body');
                }
            })
            .catch(error => console.error('Error fetching task details:', error));
    }

    function fetchWorkDetails() {
        enableTaskDetailContent();
//        addSubTaskButton.disabled = false;
//        addDateButton.disabled = false;
        const workId = sessionStorage.getItem('detailWorkID');
//        if (!workId) {
//            clearTaskDetailContent();
//            return; // 값이 없으므로 함수를 종료
//        }

        fetch(`/api/findWorkById/${workId}`)
//        fetch(`/api/findById/${workId}`)
            .then(response => {
//                console.log('Response status:', response.status); // 상태 코드 출력
                return response.text(); // 응답을 텍스트로 변환
            })
            .then(text => {
//                console.log('Response text:', text); // 응답 내용 출력
                if (text) {
                    try {
                        const data = JSON.parse(text); // Parse text as JSON'
//                        console.log(data.work_name);
                        showWorkDetail(data);
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                } else {
                    console.error('Empty response body');
                }
            })
            .catch(error => console.error('Error fetching work details:', error));
    }

    function fetchRoutineDetails() {
        enableTaskDetailContent();
        const routineId = sessionStorage.getItem('detailRoutineID');

        fetch(`/api/findRoutineById/${routineId}`)
            .then(response => {
//                console.log('Response status:', response.status); // 상태 코드 출력
                return response.text(); // 응답을 텍스트로 변환
            })
            .then(text => {
//                console.log('Response text:', text); // 응답 내용 출력
                if (text) {
                    try {
                        const data = JSON.parse(text); // Parse text as JSON'
//                        console.log(data.work_name);
//                        putGroupsToSelect();
                        showRoutineDetail(data);
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                } else {
                    console.error('Empty response body');
                }
            })
            .catch(error => console.error('Error fetching work details:', error));
    }

    function clearTaskDetailContent() {
        const taskDetailContent = document.getElementById('taskDetailContent');

        // input 요소 초기화 및 비활성화
        const inputs = taskDetailContent.querySelectorAll('input[type="text"], input[type="date"], textarea');
        inputs.forEach(input => {
            input.value = ''; // 입력 필드 값 초기화
            input.disabled = true; // 입력 필드 비활성화
            input.classList.add('disabled-style'); // CSS 클래스 추가
            if (input.tagName.toLowerCase() === 'textarea') {
                input.style.height = '100px'; // textarea 높이 초기화
            }
        });

        // span 요소 내용 초기화
        const spans = taskDetailContent.querySelectorAll('span');
        spans.forEach(span => {
            span.textContent = ''; // span의 내용 초기화
            span.classList.add('disabled-style'); // CSS 클래스 추가
        });

        // 서브 태스크 컨테이너 초기화
        const subTasksContainer = document.getElementById('subTasksContainer');
        subTasksContainer.innerHTML = '';

        // select 요소 초기화 및 비활성화
        const selects = taskDetailContent.querySelectorAll('select');
        selects.forEach(select => {
            select.selectedIndex = 0; // 기본 옵션으로 설정
            select.disabled = true; // select 요소 비활성화
            select.classList.add('disabled-style'); // CSS 클래스 추가
        });

        // button 요소 비활성화
        const buttons = taskDetailContent.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = true; // 버튼 비활성화
            button.classList.add('disabled-style'); // CSS 클래스 추가
        });
    }
    function enableTaskDetailContent() {
        const taskDetailContent = document.getElementById('taskDetailContent');

        // input 요소 활성화
        const inputs = taskDetailContent.querySelectorAll('input[type="text"], input[type="date"], textarea');
        inputs.forEach(input => {
            input.disabled = false; // 입력 필드 활성화
            input.classList.remove('disabled-style'); // 비활성화 CSS 클래스 제거
            if (input.tagName.toLowerCase() === 'textarea') {
                input.style.height = ''; // textarea 높이 원상 복구
            }
        });

        // span 요소 스타일 복구
        const spans = taskDetailContent.querySelectorAll('span');
        spans.forEach(span => {
            span.classList.remove('disabled-style'); // 비활성화 CSS 클래스 제거
        });

        // select 요소 활성화
        const selects = taskDetailContent.querySelectorAll('select');
        selects.forEach(select => {
            select.disabled = false; // select 요소 활성화
            select.classList.remove('disabled-style'); // 비활성화 CSS 클래스 제거
        });

        // button 요소 활성화
        const buttons = taskDetailContent.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = false; // 버튼 활성화
            button.classList.remove('disabled-style'); // 비활성화 CSS 클래스 제거
        });
    }


    function fetchTasksByDateRange() {
        const storedBaseDate = sessionStorage.getItem('baseDate');
        let isoDate = '';
        if (storedBaseDate) {
            const pBaseDate = new Date(storedBaseDate);
            // 유효한 Date 객체인지 확인
            if (!isNaN(pBaseDate.getTime())) {
                isoDate = pBaseDate.getFullYear() + '-' +
                          String(pBaseDate.getMonth() + 1).padStart(2, '0') + '-' +
                          String(pBaseDate.getDate()).padStart(2, '0');
            } else {
                console.error("Invalid date in sessionStorage");
            }
        }

        // fetch 요청을 보낼 때 isoDate가 빈 문자열이면, 서버로 baseDate 없이 요청을 보냄
        fetch(`/api/tasks${isoDate ? `?baseDate=${isoDate}` : ''}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Fetched data is not an array');
                }
                tasks = data;

                // Create an array with all possible days you want to render
                const allDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

                // Initialize tasksByDay with empty arrays for each day
                tasksByDay = allDays.reduce((acc, day) => {
                    acc[day] = [];
                    return acc;
                }, {});

                // Populate tasksByDay with the actual tasks
                tasks.forEach(task => {
                    const day = task.day_of_week;
                    if (!tasksByDay[day]) {
                        tasksByDay[day] = [];
                    }
                    tasksByDay[day].push(task);
                });

                renderDayTitlesList();
                allDays.forEach(day => renderDayTasksList(day));
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function fetchTasksByDay() {
        // Retrieve baseDate from sessionStorage
        const storedBaseDate = sessionStorage.getItem('baseDate');
        const day = sessionStorage.getItem('nav'); // Get the specified day
        let isoDate = '';
//console.log('fetchTasksByDay',storedBaseDate, day);
        if (storedBaseDate) {
            const pBaseDate = new Date(storedBaseDate);
            // Check if the date object is valid
            if (!isNaN(pBaseDate.getTime())) {
                isoDate = pBaseDate.getFullYear() + '-' +
                          String(pBaseDate.getMonth() + 1).padStart(2, '0') + '-' +
                          String(pBaseDate.getDate()).padStart(2, '0');
            } else {
                console.error("Invalid date in sessionStorage");
            }
        }

        // Fetch tasks with baseDate parameter if it exists
        fetch(`/api/tasks${isoDate ? `?baseDate=${isoDate}` : ''}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Fetched data is not an array');
                }
                tasks = data;
                tasksByDay = tasks.reduce((acc, task) => {
                    const taskDay = task.day_of_week;
                    if (!acc[taskDay]) {
                        acc[taskDay] = [];
                    }
                    acc[taskDay].push(task);
                    return acc;
                }, {});

                // Only render the tasks for the specified day
//                if (tasksByDay[day]) {
                renderDayTitlesList(day); // Render the day titles
                renderDayTasksList(day); // Render the tasks for the specific day
//                } else {
//                    console.error(`No tasks found for the day: ${day}`);
//                }
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function fetchTasksByWork(categoryId, completed) {
//    console.log("fetchTasksByWork catId: ",categoryId);
        let url;
        if (categoryId == undefined || categoryId == null) {
            if(completed == undefined || completed == null){
                url = `/api/tasksByWork`; // 전체 작업 목록 요청 경로
            }else{
                url = `/api/completedTasksByWork`;
            }
        } else {
            url = `/api/tasksByWork/${categoryId}`; // 특정 카테고리의 작업 목록 요청 경로
        }
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Fetched data is not an array');
                }

            tasks = data;
            // tasksByWork를 work_name을 키로 하고 work_id 및 tasks 배열을 포함하는 구조로 만듦
            tasksByWork = tasks.reduce((acc, task) => {
                const workName = task.work_name;
                const workId = task.work_id;

                if (!acc[workId]) {
                    acc[workId] = {
                        work_id: workId,
                        work_name: workName,
                        tasks: []
                    };
                }
                acc[workId].tasks.push(task);
                return acc;
            }, {});

            renderWorkTitlesList();
            Object.keys(tasksByWork).forEach(workId => renderWorkTasksList(workId));
//                renderWorkTasksList();
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function fetchRoutines() {
        fetch(`/api/findRoutines`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Fetched data is not an array');
                }

            tasks = data;
            // tasksByWork를 work_name을 키로 하고 work_id 및 tasks 배열을 포함하는 구조로 만듦
            tasksByWork = tasks.reduce((acc, task) => {
                const workName = task.group_content;
                const workId = task.routine_group;

                if (!acc[workId]) {
                    acc[workId] = {
                        work_id: null,
                        routine_id: workId,
                        routine_content: workName,
                        tasks: []
                    };
                }
                acc[workId].tasks.push(task);
                return acc;
            }, {});

            renderWorkTitlesList();
            Object.keys(tasksByWork).forEach(workId => renderRoutinesList(workId));
//                renderWorkTasksList();
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function fetchCompletedTasks() {
//        taskList.innerHTML = '';
        fetch('/api/findByStatus/2')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Fetched data is not an array');
                }

            tasks = data;
            // tasksByWork를 work_name을 키로 하고 work_id 및 tasks 배열을 포함하는 구조로 만듦
            tasksByWork = tasks.reduce((acc, task) => {
                const month = task.last_modified_month;
                const workId = task.last_modified_month;

                if (!acc[month]) {
                    acc[month] = {
                        work_id: workId,
                        month: workId,
                        tasks: []
                    };
                }
                acc[month].tasks.push(task);
                return acc;
            }, {});

            renderWorkTitlesList(true);
            Object.keys(tasksByWork).forEach(month => renderWorkTasksList(month));
//                renderWorkTasksList();
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function fetchStatus(pStat) {
//        console.log('fetchStatus(pStat)> ',pStat);
        const taskStatus = pStat;
        taskList.innerHTML = ''; // Clear current list
        fetch(`/api/findByStatus/${taskStatus}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    data.forEach(task => {
                        var taskItem;
                        if(pStat == 2) {
                            taskItem = createTaskItem(task, false, true);
                        } else {
                            taskItem = createTaskItem(task, true, true);
                        }
                        if(task.is_overdue == '1'){
                            taskItem.id = 'overdue';
                        }
                        taskList.appendChild(taskItem);
                    });
                } else {
                    taskList.appendChild(addPlaceholderForEmptyList());
                }

                orderInCertainStatus = taskStatus;
                initSortable(taskList);
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    // 요일 제목 만듦
    function renderDayTitlesList(aDay) {
        daysList.innerHTML = '';

        if (aDay == null) { // Render all days
            daysOfWeek.forEach(day => {
                const ul = document.createElement('ul');
                ul.id = `${day}Tasks`;

                const li = document.createElement('li');
//                console.log('!'+ dayDateMap.get(day));
                li.dataset.date = dayDateMap.get(day); //drag!!!!!!!!!!
                li.innerHTML = `<strong>[[ </string><strong class="custom-day-font">${day}</strong><strong> ]]</string>`;
                li.appendChild(ul);
                daysList.appendChild(li);
            });
        } else { // Render only the selected day
            const ul = document.createElement('ul');
            ul.id = `${aDay}Tasks`; // Use the provided day for the ID

            const li = document.createElement('li');
            li.innerHTML = `<strong>[[ </string><strong class="custom-day-font">${aDay}</strong><strong> ]]</string>`;
            li.appendChild(ul);
            daysList.appendChild(li);
        }
    }
    // 워크 제목 만듦
    function renderWorkTitlesList(completed) {
        daysList.innerHTML = '';

        Object.keys(tasksByWork).forEach(workId => {
            const workName = completed ? tasksByWork[workId].month : tasksByWork[workId].work_name; // work_id 가져오기
            const routineGroupId = tasksByWork[workId].routine_id; // routine의 group id 가져오기
            const routineGroupContent = tasksByWork[workId].routine_content;
//            console.log('workName:',workName,', workId:',workId,', routineGroupId:',routineGroupId);

            const ul = document.createElement('ul');
            ul.id = `${workId}Tasks`;

            const li = document.createElement('li');
            li.className = 'work-item';
            if(routineGroupId != null){
                li.setAttribute('data-group-id', routineGroupId);
            } else {
                li.setAttribute('data-work-id', workId);
            }
            // Create the strong text element for workName
            const workTitle = document.createElement('p');

            if(routineGroupId != null) {
                workTitle.classList.add('work-title');
                workTitle.classList.add('work-title-group');
                workTitle.innerHTML = `<strong>[[</strong> <strong class="custom-day-font">${routineGroupContent}</strong> <strong>]]</strong>`;
            } else if(workId == 999999 || completed) {
                workTitle.innerHTML = `<strong></strong> <strong class="custom-day-font">${workName}</strong> <strong></strong>`;
            } else {
                workTitle.className = 'work-title';
                workTitle.innerHTML = `<strong>[[</strong> <strong class="custom-day-font">${workName}</strong> <strong>]]</strong>`;
            }

            // Create the edit button
            if(!completed){
//                console.log("> ",workId,',',routineGroupId);
                const editBtn = document.createElement('span');
                editBtn.textContent = '✎';
                editBtn.className = 'work-edit-btn';
                editBtn.addEventListener('click', function(event) {
                    event.stopPropagation();
                    var newName;
                    if(routineGroupId != null) newName = prompt('Edit group:', routineGroupContent);
                    else newName = prompt('Edit work:', workName);
                    if (newName) {
                        if(routineGroupId != null) updateRoutine(null, routineGroupId, newName);
                        else saveWork(workId, newName);
                    }
                });
                const deleteBtn = document.createElement('span');
                deleteBtn.textContent = '✖';
                deleteBtn.className = 'work-delete-btn';
                deleteBtn.addEventListener('click', function(event) {
                    event.stopPropagation();
                    if(routineGroupId != null) {
                        document.getElementById('confirmDeleteButtonG').setAttribute('data-group-id', routineGroupId);
                        deleteConfirmationModalG.style.display = 'block';
                    } else {
                        document.getElementById('confirmDeleteButtonWork').setAttribute('data-work-id', workId);
                        document.getElementById('deleteMessage').innerHTML = `Delete this work?<br>Tasks' work will be set to null.`;
                        deleteConfirmationModalWork.style.display = 'block';
                    }
//                    document.getElementById('confirmDeleteButtonG').setAttribute('data-group-id', routineGroupId);
    //                document.getElementById('confirmDeleteButtonWork').setAttribute('data-work-name', workName);
                });
                workTitle.appendChild(editBtn);
                workTitle.appendChild(deleteBtn);
            }
             if(routineGroupId != null) {
                const routineToListBtn = document.createElement('button');
                routineToListBtn.textContent = 'ADD TO LIST';
                routineToListBtn.className = 'routineToListBtn';
                routineToListBtn.addEventListener('click', function(event) {
                    event.stopPropagation();

                    const checkedBoxes = document.querySelectorAll('.routine-checkbox:checked');
                    const selectedRoutineIds = Array.from(checkedBoxes)
                        .filter(checkbox => checkbox.getAttribute('data-group-id') === routineGroupId)
                        .map(checkbox => checkbox.getAttribute('data-routine-id'));

                    // 체크된 항목들의 routine_id 출력
                    console.log('Selected Routine IDs (Matching group ID):', selectedRoutineIds);

                    // 선택된 루틴을 서버로 전송
                    saveRoutineToList(selectedRoutineIds);
                });

                // workTitle에 routineToListBtn 추가
                workTitle.appendChild(routineToListBtn);
            }
            li.appendChild(workTitle);
//            li.appendChild(editBtn);
//            li.appendChild(deleteBtn);
            li.appendChild(ul); // Append the ul below the title and button
            daysList.appendChild(li);
        });
    }

    taskForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(taskForm);
        const action = event.submitter.value;
        if (action === 'TASK' && taskInput.value.trim() === '') {
            showNotification('Enter a task', 'error');
            return; // Prevent form submission
        }
        if (action === 'WORK' && workInput.value.trim() === '') {
            showNotification('Enter a work', 'error');
            return; // Prevent form submission
        }
        if (action === 'GROUP' && groupInput.value.trim() === '') {
            showNotification('Enter a group', 'error');
            return; // Prevent form submission
        }
        if (action === 'ROUTINE' && routineInput.value.trim() === '') {
            showNotification('Enter a routine', 'error');
            return; // Prevent form submission
        }

        // selectedDate가 null이 아닐 때 do_dates에 추가
        if (selectedDate !== null && selectedDate !== '') {
            formData.append('do_dates', selectedDate);
        }
        formData.append('action', action);

        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                body: formData,
            });

            // 서버 응답 체크
            if (!response.ok) {
                const errorData = await response.json(); // JSON 응답 파싱
                showNotification(errorData.message || 'An error occurred', 'error'); // 에러 메시지만 표시
                return;
            }

            const data = await response.json();

            taskInput.value = '';
            workInput.value = '';
            groupInput.value = '';
            routineInput.value = '';

            if (selectedSide === 'work') {
                clickSideBar('work', true);
                putWorksToSelect();
                return;
            }
            if(action === 'GROUP') {
                putGroupsToSelect();
            }

            // fetchNewId()를 기다리고 나서 fetchTaskDetails 실행
            if(action === 'TASK'){
                await fetchNewId();  // fetchNewId가 비동기 작업일 경우
                fetchTaskDetails(selectedDate);
            }
            clickSideBar(selectedSide, false);
        } catch (error) {
            console.error('Error:', error);
            showNotification('Network error', 'error');
        }
    });

    function saveRoutineToList(selectedRoutineIds){
        fetch('/api/saveRoutineToList', {  // 서버의 엔드포인트 URL을 여기에 입력
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  // JSON 형식으로 데이터 전송
            },
            body: JSON.stringify({ routineIds: selectedRoutineIds }) // 선택된 routine_id 배열을 JSON으로 변환
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok'); // 에러 처리
            }
            return response.json(); // JSON 응답으로 변환
        })
        .then(data => {
            console.log('Server response:', data); // 서버로부터의 응답 처리
            showNotification('Routines added to the task list', 'success');
            // 여기서 성공적인 응답에 대한 작업을 수행 (예: 사용자에게 알림 등)
        })
        .catch(error => {
            console.error('Error:', error); // 에러 처리
        });

    }

    function saveSubTask(subTaskContent) {
        const taskData = { // Collect form data
            task_content: subTaskContent,
            do_date: '9999-12-31',
            parent_task_id: sessionStorage.getItem('detailID')
        };
        fetch(`/api/saveSubTask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Sub task saved', 'success');
            sessionStorage.setItem('detailID',sessionStorage.getItem('detailID'));
            fetchTaskDetails(sessionStorage.getItem('detailDoDate'));
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
            showNotification('Network error', 'error');
        });

    }

    function fetchNewId() {
        return fetch(`/api/newId`)
            .then(response => response.json()) // Convert the response to JSON
            .then(id => {
                sessionStorage.setItem('detailID', id);
                console.log("fetchNewId: ", sessionStorage.getItem('detailID'));
            })
            .catch(error => {
                console.error('Error fetching ID:', error);
                throw error; // 에러가 발생하면 catch에서 다시 throw하여 외부에서 처리 가능하도록
            });
    }

    saveChangesButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the form from submitting the default way
//        const datesString = getDatesString();

        const taskData = { // Collect form data
            task_content: document.getElementById('taskName').value,
            category_id: document.getElementById('categoryName').value,
            work_id: document.getElementById('workName').value,
            due_date: document.getElementById('dueDate').value,
//            do_dates: datesString,
//            task_status: document.querySelector('input[name="status"]:checked').value,
            task_status: document.getElementById('taskStatus').value
//            task_done: document.getElementById('taskDone').value,
//            do_date: sessionStorage.getItem('detailDoDate'),//........
//            task_memo: document.getElementById('taskMemo').value
        };

        const idForDetail = sessionStorage.getItem('detailID');
        fetch(`/api/updateTask/${idForDetail}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
//            console.log('Success:', data);
            showNotification('Successfully updated!', 'success');
            fetchTaskDetails(sessionStorage.getItem('detailDoDate'));
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    });

    function updateTask(dataToChange) {
        var taskData = {};
        switch (dataToChange) {
            case 'taskName':
                taskData = {task_content: document.getElementById(dataToChange).value}
                break;
            case 'categoryName':
            console.log('cate:',document.getElementById(dataToChange).value,',',document.getElementById(dataToChange).value==null);
                taskData = {category_id: document.getElementById(dataToChange).value}
                break;
            case 'workName':
            console.log('work:',document.getElementById(dataToChange).value,',',document.getElementById(dataToChange).value==null);
                taskData = {work_id: document.getElementById(dataToChange).value}
                break;
            case 'dueDate':
                taskData = {due_date: document.getElementById(dataToChange).value}
                break;
            case 'taskStatus':
                taskData = {task_status: document.getElementById(dataToChange).value}
                break;
            default: break;
        }
//        const taskData = { // Collect form data
//            task_content: document.getElementById('taskName').value,
//            category_id: document.getElementById('categoryName').value,
//            work_id: document.getElementById('workName').value,
//            due_date: document.getElementById('dueDate').value,
////            do_dates: datesString,
////            task_status: document.querySelector('input[name="status"]:checked').value,
//            task_status: document.getElementById('taskStatus').value
////            task_done: document.getElementById('taskDone').value,
////            do_date: sessionStorage.getItem('detailDoDate'),//........
////            task_memo: document.getElementById('taskMemo').value
//        };

        const idForDetail = sessionStorage.getItem('detailID');
        fetch(`/api/updateTask/${idForDetail}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
//            console.log('Success:', data);
            showNotification('Successfully updated!', 'success');
            fetchTaskDetails(sessionStorage.getItem('detailDoDate'));
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    }

    function updateRoutine(dataToChange, groupId, newgroupContent) {
        var taskData = {};
        var idForDetail = sessionStorage.getItem('detailRoutineID');
        if(dataToChange == null) {
        console.log('1',groupId,',',newgroupContent);
            idForDetail = groupId;
            taskData = {routine_content: newgroupContent}
        } else {
            switch (dataToChange) {
                case 'routineContent':
                    taskData = {routine_content: document.getElementById(dataToChange).value}
                    break;
                case 'routineCycle':
                    taskData = {repetition_cycle: document.getElementById(dataToChange).value}
                    break;
    //            case 'routineMonth':
    //                taskData = {routine_month: document.getElementById(dataToChange).value}
    //                break;
                case 'routineDate':
                    taskData = {routine_date: document.getElementById(dataToChange).value}
                    break;
                case 'routineDay':
                    taskData = {routine_day: document.getElementById(dataToChange).value}
                    break;
                case 'routineForYear':
                    taskData = {routine_date: document.getElementById('routineMonth').value + '-' + document.getElementById('routineDate').value}
                    break;
                case 'groupContent':
                    taskData = {routine_group: document.getElementById(dataToChange).value}
                    break;
                default: break;
            }
        }

        fetch(`/api/updateRoutine/${idForDetail}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
//            console.log('Success:', data);
            showNotification('Successfully updated!', 'success');
            if(dataToChange != null) fetchRoutineDetails();
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    }

    function memoChange() {
        const taskData = {
            task_memo: document.getElementById('taskMemo').value
        };

        const idForDetail = sessionStorage.getItem('detailID');
        fetch(`/api/updateTask/${idForDetail}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Successfully updated!', 'success');
            if (subTaskMemoUpdateSubId) {
                sessionStorage.setItem('detailID', subTaskMemoUpdateSubId);
                subTaskMemoUpdateSubId = false;
            }
            fetchTaskDetails(sessionStorage.getItem('detailDoDate'));
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    }

    function delegationChange() {
        const taskData = {
            assignee_id: document.getElementById('userDelegated').value
        };

        const idForDetail = sessionStorage.getItem('detailID');
        fetch(`/api/updateTask/${idForDetail}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Successfully updated!', 'success');
//            sessionStorage.setItem('detailID', subTaskMemoUpdateSubId);
            fetchTaskDetails(sessionStorage.getItem('detailDoDate'));
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    }

    function updateDoDateTaskDone(param, refreshList) {
        var doneValue = '';
        if(param == 'Done') doneValue = 2;
        else if(param == 'Undone') doneValue = 1;
        else doneValue = document.getElementById('taskDone').value;
        console.log("! doneValue: ",doneValue,",",document.getElementById('doDate').value);
        sessionStorage.setItem('detailDoDate', document.getElementById('doDate').value);
        const taskData = { // Collect form data
            task_done: doneValue,
            do_date: document.getElementById('doDate').value//........
        };

        const idForDetail = sessionStorage.getItem('detailID');
        fetch(`/api/updateDoDateTaskDone/${idForDetail}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Successfully updated!', 'success');
            if(refreshList) {
                fetchTaskDetails(sessionStorage.getItem('detailDoDate'));
                clickSideBar(selectedSide, false);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function saveWork(workId, newName) {
//        const workId = workId;
        let taskData;
        // newName이 없는 경우, work detail에서 수정하는 것이므로 수정내용 받아온다
        if (newName == undefined || newName == null) {
//                console.log('::: ', document.getElementById('categoryName').value);
            taskData = {
                work_name: document.getElementById('workNameInput').value,
                category_id: document.getElementById('categoryName').value,
                work_status: document.getElementById('workStatus').value
            }
        } else {
            taskData = {
                work_name: newName
            }
        }
        fetch(`/api/updateWork/${workId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Work updated!', 'success');
            fetchWorkDetails();
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    }

    function deleteWork(workId) {
        // Send delete request to the server
        fetch(`/api/deleteWork/${workId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Deleted:', data);
            showNotification('Work deleted.', 'delete');
            clickSideBar(selectedSide, true);
            deleteConfirmationModalWork.style.display = 'none';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function deleteRoutine(routineId, isGroup) {
        fetch(`/api/deleteRoutine/${routineId}?isGroup=${isGroup}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(async (response) => {
            if (!response.ok) {
                const errorData = await response.json(); // JSON 응답 파싱
                showNotification(errorData.message || 'An error occurred', 'error'); // 에러 메시지 표시
                deleteConfirmationModalR.style.display = 'none';
                deleteConfirmationModalG.style.display = 'none';
                return;
            }
            return response.json(); // 성공 시 데이터를 반환
        })
        .then(data => {
            if (data) {
                console.log('Deleted:', data);
                showNotification('Routine/Group deleted.', 'delete');
                clickSideBar(selectedSide, true);
                deleteConfirmationModalR.style.display = 'none';
                deleteConfirmationModalG.style.display = 'none';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showNotification('An unexpected error occurred.', 'error');
        });
    }

    function clearParent(taskId) {
        fetch(`/api/clearParent/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('cleared:', data);
            showNotification('Changed from Sub to Main', 'success');
            fetchTaskDetails(sessionStorage.getItem('detailDoDate')); // 태스크 상세정보 갱신
            clickSideBar(selectedSide, false);
            clearParentTaskModal.style.display = 'none';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    document.getElementById('confirmDeleteButton').addEventListener('click', () => {
        const curId = sessionStorage.getItem('detailID');
//        console.log('curId? delete: ',curId);
        if (curId) {
            // Send delete request to the server
            fetch(`/api/deleteTask/${curId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Deleted:', data);
                // Handle success (e.g., show a message, remove the task from the list, etc.)
                deleteConfirmationModal.style.display = 'none';
                showNotification('Task deleted.', 'delete');

                sessionStorage.setItem('detailID', '');
                clickSideBar(selectedSide, true);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });

    document.getElementById('confirmDeleteButtonWork').addEventListener('click', () => {
        const workId = document.getElementById('confirmDeleteButtonWork').getAttribute('data-work-id');
        console.log("워크삭제, 아이디: ",workId);
        deleteWork(workId); // 실제 삭제 함수 호출
    });

    document.getElementById('confirmDeleteButtonR').addEventListener('click', () => {
        const routineId = document.getElementById('confirmDeleteButtonR').getAttribute('data-routine-id');
        console.log("루틴삭제, 아이디: ",routineId);
        deleteRoutine(routineId); // 실제 삭제 함수 호출
    });

    document.getElementById('confirmDeleteButtonG').addEventListener('click', () => {
        const routineId = document.getElementById('confirmDeleteButtonG').getAttribute('data-group-id');
        console.log("그룹삭제, 아이디: ",routineId);
        deleteRoutine(routineId, "group"); // 실제 삭제 함수 호출
    });

    document.getElementById('cancelDeleteButton').addEventListener('click', () => {
        deleteConfirmationModal.style.display = 'none';
    });

    document.getElementById('cancelDeleteButtonWork').addEventListener('click', () => {
        deleteConfirmationModalWork.style.display = 'none';
    });

    document.getElementById('cancelDeleteButtonR').addEventListener('click', () => {
        deleteConfirmationModalR.style.display = 'none';
    });

    document.getElementById('cancelDeleteButtonG').addEventListener('click', () => {
        deleteConfirmationModalG.style.display = 'none';
    });

    document.getElementById('confirmClearParent').addEventListener('click', () => {
        const taskId = sessionStorage.getItem('detailID');
        console.log("메인클리어, 현task아이디: ",taskId);
        clearParent(taskId); // 실제 삭제 함수 호출
    });

    document.getElementById('cancelClearParent').addEventListener('click', () => {
        clearParentTaskModal.style.display = 'none';
    });

    // Close the delete confirmation modal when the user clicks anywhere outside of the modal
    window.addEventListener('click', (event) => {
        if (event.target === deleteConfirmationModal) {
            deleteConfirmationModal.style.display = 'none';
        }
        if (event.target === deleteConfirmationModalWork) {
            deleteConfirmationModalWork.style.display = 'none';
        }
        if (event.target === clearParentTaskModal) {
            clearParentTaskModal.style.display = 'none';
        }
    });

    async function populateCategories() {
        try {
            const response = await fetch('/api/getCategories');
            const categories = await response.json();
            categoriesList = categories; // 전역 변수에 저장

            const categorySelect = document.getElementById('categoryName');
            categorySelect.innerHTML = '';
            categorySelect.innerHTML = '<option value="" selected class="select-placeholder">Select a category</option>';

//            const defaultOption = document.createElement('option');
////            defaultOption.value = '';
//            categorySelect.appendChild(defaultOption);

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.category_id;
                option.textContent = category.category_name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    const populateDoDates = (dates) => {
        const doDatesContainer = document.getElementById('doDatesContainer');
        doDatesContainer.innerHTML = ''; // Clear existing dates

        dates.forEach((date, index) => {
            const dateInputGroup = document.createElement('div');
            dateInputGroup.className = 'date-group';

            const dateInput = document.createElement('input');
            dateInput.required = true;  // Required 속성 추가
            dateInput.type = 'date';
            dateInput.value = date; // Assuming the date is in YYYY-MM-DD format
            dateInput.id = `doDates_${index}`; // Unique ID
            let originalValue = dateInput.value; // Track the original value of the date input

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'date-button remove';
            removeButton.textContent = '-';
            removeButton.addEventListener('click', () => {
//                console.log("dateRemove! ",sessionStorage.getItem('detailID'),',',originalValue);
                deleteDetailDoDate(sessionStorage.getItem('detailID'), originalValue);
                dateInputGroup.remove();
//                saveTaskData(); // Save changes when removing a date
//                updateDoDates();
            });

            dateInput.addEventListener('change', (event) => {
                if (event.target.value !== originalValue) {
//                    console.log("dateChange! ",sessionStorage.getItem('detailID'),',',originalValue,">>",event.target.value);
                    updateDetailDoDate(sessionStorage.getItem('detailID'), originalValue, event.target.value);
//                    saveTaskData(); // Call your function if the value has changed
//                    updateDoDates();
                }
            });
            dateInputGroup.appendChild(dateInput);
            dateInputGroup.appendChild(removeButton);

            doDatesContainer.appendChild(dateInputGroup);
        });
    };

    const addDateInputGroup = () => {
        // Get the current number of date input groups
        const index = document.querySelectorAll('#doDatesContainer .date-group').length;

        // Create a new div element for the date group
        const newDateInputGroup = document.createElement('div');
        newDateInputGroup.className = 'date-group';

        // Create a new date input element
        const newDateInput = document.createElement('input');
        newDateInput.required = true;  // Required 속성 추가
        newDateInput.type = 'date';
        newDateInput.id = `doDates_${index}`; // Set a unique ID for the new date input

        let originalValue = newDateInput.value;

        // Create a new remove button element
        const newRemoveButton = document.createElement('button');
        newRemoveButton.type = 'button';
        newRemoveButton.className = 'date-button remove';
        newRemoveButton.textContent = '-';
        newRemoveButton.addEventListener('click', () => {
            console.log("dateRemove! ",sessionStorage.getItem('detailID'),',',originalValue);
            deleteDetailDoDate(sessionStorage.getItem('detailID'), originalValue);
            newDateInputGroup.remove(); // Remove the date group when the remove button is clicked
        });

        newDateInput.addEventListener('change', (event) => {
                    console.log(event.target.value,"/");
            if (event.target.value !== originalValue) {
                if(document.getElementById('doDate').value.startsWith('9999')){
                    originalValue = document.getElementById('doDate').value;
//                    console.log('9999');
                }
                console.log("dateAdd! ",sessionStorage.getItem('detailID'),',',originalValue,">>",event.target.value);
                updateDetailDoDate(sessionStorage.getItem('detailID'), originalValue, event.target.value);
            }
        });

        // Append the date input and remove button to the date group
        newDateInputGroup.appendChild(newDateInput);
        newDateInputGroup.appendChild(newRemoveButton);

        // Append the new date group to the container
        const doDatesContainer = document.getElementById('doDatesContainer');
        doDatesContainer.appendChild(newDateInputGroup);
        addDateButton.disabled = true;
    };

    // Add event listener to the add date button
    addDateButton.addEventListener('click', addDateInputGroup);

    //  SUBTASK
    let isTaskPopulated = false;  // 중복 호출 방지를 위한 플래그
    const populateSubTasks = async (tasks, is_assigned_to_me) => {
        if (isTaskPopulated) return;
        isTaskPopulated = true;
        subTasksContainer.innerHTML = ''; // Clear existing sub-tasks

        for (let [index, taskId] of tasks.entries()) {
            try {
                // Fetch task content based on taskId
                const response = await fetch(`/api/findTaskContent/${taskId}`);
                const task = await response.json();
//                console.log(taskId); // Task ID should now appear in correct order

                if (task && task.task_content) {
                    const subTaskGroup = document.createElement('div');
                    subTaskGroup.className = 'new-sub-task';
                    const subtaskSpan = document.createElement('span');
                    subtaskSpan.type = 'text';
                    subtaskSpan.innerText = '- ' + task.task_content;
                    subtaskSpan.id = `subTasks_${index}`; // Unique ID
                    subtaskSpan.dataset.taskId = taskId; // Store task_id in data attribute

                    subTaskGroup.appendChild(subtaskSpan);
                    subTasksContainer.appendChild(subTaskGroup);

                    if(is_assigned_to_me) disableTaskDetailFields();
                    else enableTaskDetailFields();

                    subtaskSpan.addEventListener('click', () => {
                        console.log('Clicked on subtask with ID:', taskId);
                        sessionStorage.setItem('detailID', taskId);
                        fetchTaskDetails();
                    });
                } else {
                    console.error('Task content not found for taskId:', taskId);
                }
            } catch (error) {
                console.error('Error fetching task details:', error);
            }
        }

        isTaskPopulated = false;
    };

    const addSubTaskGroup = () => {
        // Get the current number of date input groups
        const index = document.querySelectorAll('#subTasksContainer .new-sub-task').length;

        const newSubTaskGroup = document.createElement('div');
        newSubTaskGroup.className = 'new-sub-input';
        newSubTaskGroup.classList.add('new-sub-task');

        const newTaskInput = document.createElement('input');
        newTaskInput.required = true;  // Required 속성 추가
        newTaskInput.type = 'text';
        newTaskInput.id = `subTasks_${index}`; // Set a unique ID for the new date input

        newTaskInput.addEventListener('change', (event) => {
                saveSubTask(event.target.value);
        });

        newSubTaskGroup.appendChild(newTaskInput);
        subTasksContainer.appendChild(newSubTaskGroup);
        addSubTaskButton.disabled = true;
    };

    addSubTaskButton.addEventListener('click', addSubTaskGroup);

    const getDatesString = (replacementDate = null) => {
        let datesSet = new Set();

        if (replacementDate) {
            datesSet.add(replacementDate);
        } else {
            // Otherwise, get the dates from the inputs as usual
            const dateInputs = document.querySelectorAll('#doDatesContainer input[type="date"]');
            dateInputs.forEach(input => {
                if (input.value) {
                    datesSet.add(input.value);
                }
            });
        }

        // Convert the set to an array and sort the dates in ascending order
        let datesArray = Array.from(datesSet);
        datesArray.sort((a, b) => new Date(a) - new Date(b));

        return datesArray.join(',');
    };

    function handleNavItemClick(event) {
        const target = event.target.closest('.nav-item');
        if (!target) return; // 클릭된 요소가 .nav-item이 아닐 경우

        const clickedDay = target.dataset.day || '';
        const date = target.dataset.date || '';
        const clickedCat = target.dataset.categoryId || '';
    console.log("clickedDay:",clickedDay,"/date:",date,",clickedCat:",target.dataset.categoryId);
        sessionStorage.setItem('baseDate', date);

        if (selectedSide === 'week') {
            if (sessionStorage.getItem('nav') === clickedDay) { // 날짜 선택 해제
                sessionStorage.setItem('nav', '');
                selectedDate = null;
                sessionStorage.setItem('baseDate', '');
                target.classList.remove('active'); // 배경색 원래대로
                fetchTasksByDateRange();
            } else { // 날짜 새로 선택
                sessionStorage.setItem('nav', clickedDay);
                selectedDate = date;
                sessionStorage.setItem('baseDate', date);
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                target.classList.add('active'); // 배경색 변경
                fetchTasksByDay();
            }
        }
        if (selectedSide === 'work') {
            if (sessionStorage.getItem('nav') === clickedCat) { // 카테고리 선택 해제
                sessionStorage.setItem('nav', '');
//                selectedDate = null;
                sessionStorage.setItem('clickedCat', '');
//                target.classList.remove('active'); // 배경색 원래대로
//                fetchTasksByWork(clickedCat);
            } else { // 카테고리 새로 선택
                sessionStorage.setItem('nav', clickedCat);
//                selectedDate = date;
                sessionStorage.setItem('clickedCat', clickedCat);
            }
        }
    }

    // TODAY 버튼 클릭 이벤트 핸들러
    document.getElementById('today-button').addEventListener('click', function(event) {
        event.stopPropagation(); // 상위 요소로 이벤트 전파를 막음

        sessionStorage.setItem('today', 'true');
        const today = new Date();
        const date = formatDate(today);
        const weekday = daysOfWeek[(today.getDay() + 6) % 7]; // 'MON', 'TUE' 형식의 요일

        document.querySelectorAll('.side-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.side-item[data-side="week"]`).classList.add('active');
        updateNavigationBar('week');
        updateWeekDisplay();
        updateWeekDates();
        sessionStorage.setItem('today', 'false');
        selectedSide = 'week';

        // 실제 .nav-item 요소를 찾기
        const target = findNavItemByDate(date);

        if (target) {
            // 가상의 이벤트 객체를 생성하지 않고 실제 클릭 이벤트를 시뮬레이션
            handleNavItemClick({ target });
//        clickSideBar('week');
            showForm(); // 폼을 보이게 함
            fetchMainTaskList();
            clearTaskDetailContent();
        } else {
            console.error('No matching .nav-item found for the date:', date);
        }
    });

    // 클릭된 .nav-item을 찾는 함수
    function findNavItemByDate(date) {
        return document.querySelector(`.nav-item[data-date="${date}"]`);
    }

    function triggerNavItemClick(dayName) {
        const navItem = [...document.querySelectorAll('.nav-item')].find(item => item.dataset.day === dayName);
        console.log('triggerNavItemClick!!');
        if (navItem) {
            // 클릭 이벤트 객체 생성
            const clickEvent = new MouseEvent('click', {
                bubbles: true, // 이벤트가 상위 요소로 전파되도록
                cancelable: true, // 이벤트를 취소할 수 있도록
                view: window // 이벤트가 브라우저 창을 참조하도록
            });

            // 클릭 이벤트 디스패치
            navItem.dispatchEvent(clickEvent);
        } else {
            console.error(`No nav-item found for day: ${dayName}`);
        }
    }

    // Utility function to format a date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function closeWarningModal() {
        validationModal.style.display = 'none';
    }

    // Close the modal when the user clicks on <span> (x)
    window.closeWarningModal = closeWarningModal;

    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add notification to container
        const container = document.getElementById('notificationContainer');
        container.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 400); // Remove element after fade-out
        }, 2500);
    }

    function calcHeight(textarea) {
        console.log('calcHeight!');
        const scrollTop = textarea.scrollTop; // 현재 스크롤 위치 저장

        // 높이 자동 조정
        textarea.style.height = "auto"; // 높이 재설정
        textarea.style.height = textarea.scrollHeight + "px"; // 스크롤 높이에 맞춰 설정

        // 스크롤 위치 복구
        textarea.scrollTop = scrollTop;
    }

    // textarea에서 엔터 키 또는 한 줄이 넘어가는 상황을 감지
    taskMemoContent.addEventListener("input", (e) => {
        const currentLineCount = taskMemoContent.value.split("\n").length;
        const lineHeight = parseFloat(window.getComputedStyle(taskMemoContent).lineHeight);
        const maxVisibleLines = Math.floor(taskMemoContent.clientHeight / lineHeight);

        // 현재 스크롤 위치 저장
        const scrollTop = taskMemoContent.scrollTop;
        if (currentLineCount > maxVisibleLines || e.inputType === 'insertLineBreak') {
            taskMemoContent.scrollTop = scrollTop;
            calcHeight(taskMemoContent);
        }
    });

    function createTaskItem(task, hamburgerYN, workYN) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.setAttribute('data-task-id', task.task_id);

        const taskContainer = document.createElement('a'); // Use <a> to wrap all content
        taskContainer.className = 'task_content';

        const taskContentSpan = document.createElement('span');
        taskContentSpan.textContent = task.task_content;
        taskContentSpan.className = 'task_content';

        const workNameSpan = document.createElement('span');
        if(workYN) {
            workNameSpan.textContent = task.work_name;
            workNameSpan.className = 'work_name';
        } else {
            workNameSpan.textContent = '';
            workNameSpan.className = 'work_name';
        }

        const dueDateSpan = document.createElement('span');
        dueDateSpan.textContent = task.due_date;
        dueDateSpan.className = 'due_date';

//        console.log("0 task.do_date:",task.do_date);
        if(task.do_date){
//            console.log("1 task.do_date:",task.do_date);
            li.setAttribute('data-task-dodate', task.do_date);
        }

//        console.log("0 task.task_done:",task.task_done);
        const doneSpan = document.createElement('span');
        if(task.task_done == '1'){
            doneSpan.textContent = '';
        } else if(task.task_done == '2') {
            doneSpan.textContent = '[Done] ';
        } else if(task.task_done == '3') {
            doneSpan.textContent = '[Waiting] ';
        }
        doneSpan.className = 'task_done';

        taskContainer.appendChild(doneSpan);
        if(task.parent_task_content != '0') {
            const parentTaskContentSpan = document.createElement('span');
            parentTaskContentSpan.textContent = task.parent_task_content+' > ';
            parentTaskContentSpan.className = 'parent_task_content';
            taskContainer.appendChild(parentTaskContentSpan);
        }
        taskContainer.appendChild(taskContentSpan);
        taskContainer.appendChild(workNameSpan);
        taskContainer.appendChild(dueDateSpan);

        if (task.task_status == 2 || task.task_status == 3) { // completed or canceled
            taskContainer.classList.add('task-status-completed'); // Add custom class
        }

        const hamburgerIcon = document.createElement('span');
        if(hamburgerYN) {
            hamburgerIcon.className = 'hamburger-icon';
            hamburgerIcon.textContent = '☰'; // Using the Unicode character for hamburger icon
        } else {
            hamburgerIcon.className = 'non-hamburger-icon';
            hamburgerIcon.textContent = '▷'; // Using the Unicode character for hamburger icon
        }
        li.appendChild(hamburgerIcon);
        li.appendChild(taskContainer);

        return li;
    }

    function createRoutineItem(routine) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.setAttribute('data-routine-id', routine.routine_id);

        const taskContainer = document.createElement('a'); // Use <a> to wrap all content
        taskContainer.className = 'task_content';

        const taskContentSpan = document.createElement('span');
        taskContentSpan.textContent = routine.routine_content;
        taskContentSpan.className = 'task_content';

        taskContainer.appendChild(taskContentSpan);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'routine-checkbox';
        checkbox.setAttribute('data-routine-id', routine.routine_id);
        checkbox.setAttribute('data-group-id', routine.routine_group);

        li.appendChild(checkbox);         // Add the checkbox first
        li.appendChild(taskContainer);    // Finally add the task content

        return li;
    }


    function putWorksToSelect(categoryId, workId) {
//        console.log('putWorksToSelect');
        fetch(`/api/works/${categoryId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const selectElement = document.getElementById('workName');
                selectElement.innerHTML = '<option value="" selected class="select-placeholder">Select a work</option>';

                data.forEach(work => {
                    const option = document.createElement('option');
                    option.value = work.work_id;
                    option.textContent = work.work_name;

                    // 특정 workId가 있는 경우, 해당 옵션을 선택 상태로 설정
                    if (workId != null && workId != '' && work.work_id === workId) {
                        option.selected = true;
                    }
                    selectElement.appendChild(option);
                });

                // workId가 null 또는 빈 문자열일 경우 빈 옵션을 선택 상태로 유지
                if (workId === null || workId === '') {
                    selectElement.value = null;  // 기본 빈 옵션 선택
                }
            })
            .catch(error => console.error('Error fetching works:', error));
    }

    function putGroupsToSelect() {
//        console.log('putGroupsToSelect');
        fetch(`/api/groups`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const selectElement = document.getElementById('groupContent');
                selectElement.innerHTML = '<option value="" selected class="select-placeholder">Select a group</option>';

                data.forEach(group => {
                    const option = document.createElement('option');
                    option.value = group.routine_id;
                    option.textContent = group.routine_content;
                    selectElement.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching groups:', error));
    }

    function putUsersToSelect() {
        document.querySelector('.input-group.delegation').style.display = 'flex';
        fetch('/api/users')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const selectElement = document.getElementById('userDelegated');
                selectElement.innerHTML = '<option value="" selected class="select-placeholder">Select a person</option>';

                data.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.assignee_id;
                    option.textContent = user.assignee_name;
                    selectElement.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching users:', error));
    }

    function addPlaceholderForEmptyList() {
        const emptyPlaceholder = document.createElement('li');
        emptyPlaceholder.className = 'empty-placeholder';
        emptyPlaceholder.textContent = 'No tasks available';
        emptyPlaceholder.style.pointerEvents = 'none'; // Prevent any interaction with the placeholder
        emptyPlaceholder.style.cursor = 'default';
        return emptyPlaceholder;
    }

    function validateForm(event) {
        event.preventDefault(); // 기본 폼 제출 방지
    }

    document.getElementById('addUserForm').addEventListener('submit', validateForm);
    function validateForm(event) {
        event.preventDefault(); // 기본 폼 제출 방지
        const newPassword = document.getElementById('newpassword').value;
        const confirmPassword = document.getElementById('confirmpassword').value;
        const adminPassword = document.getElementById('adminpassword').value;
        const errorMessageDiv = document.getElementById('errorMessage');

        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = "none";

        console.log('validateForm: ',newPassword !== confirmPassword,adminPassword !== "terry");

        if (newPassword !== confirmPassword) { // 비밀번호 일치 여부 확인
            errorMessageDiv.textContent = "Passwords do not match.";
            errorMessageDiv.style.display = "block";
            return false; // 폼 제출 방지
        }

        if (adminPassword !== "terry") { // 관리자 비밀번호 확인
            errorMessageDiv.textContent = "Incorrect admin approval password.";
            errorMessageDiv.style.display = "block";
            return false; // 폼 제출 방지
        }

        showNotification('User added', 'success');
        // 모든 검증 통과 시 폼 제출
        document.getElementById('addUserForm').submit();
    }

    document.getElementById('routineCycle').addEventListener('change', function() {
        const selectedCycle = this.value;

        // 기본적으로 숨기기
        routineMonth.style.display = 'none';
        routineDay.style.display = 'none';
        routineDate.style.display = 'none';

        if (selectedCycle === 'day') {
            // "Every day"일 경우, 날짜 선택을 비활성화
            routineDate.style.display = 'none';
            routineDay.style.display = 'flex';
            routineDay.innerHTML = '<option value="everyday">Every day</option>';
        } else if (selectedCycle === 'week') {
            // 주간 반복, 요일 선택 활성화
            routineDay.style.display = 'flex';
            routineDate.style.display = 'none'; // 날짜 선택은 숨기기
        } else if (selectedCycle === 'month') {
            // 월간 반복, 1일부터 31일까지 선택할 수 있도록 날짜 선택 활성화
            routineDay.style.display = 'none';
            routineDate.style.display = 'flex';
        } else if (selectedCycle === 'year') {
            // 연간 반복, 월과 날짜 모두 선택 가능
            routineMonth.style.display = 'flex';
            routineDate.style.display = 'flex';
            routineDay.style.display = 'none'; // 요일은 숨기기
        }
    });

    // routineMonth 선택에 따라 routineDay 옵션 변경 (월에 따른 일수 동적 변경)
    document.getElementById('routineMonth').addEventListener('change', function() {
        const routineDate = document.getElementById('routineDate');
        const selectedMonth = parseInt(this.value); // 선택된 월
        if(routineDate.value >= 28) {
            routineDate.innerHTML = '<option value="" disabled selected class="select-placeholder">Select a day</option>';
        }

        let daysInMonth = 31; // 기본 31일
        if ([4, 6, 9, 11].includes(selectedMonth)) {
            daysInMonth = 30; // 4월, 6월, 9월, 11월은 30일
        } else if (selectedMonth === 2) {
            daysInMonth = 28; // 2월은 기본 28일 (윤년은 추가 로직 필요)
        }

        // 1일부터 선택된 월에 맞는 마지막 일수까지 추가
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            routineDate.appendChild(option);
        }
    });
});
