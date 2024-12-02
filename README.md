# TaskHub Project

TaskHub is a robust **task management system** designed to help individuals and teams manage complex workflows, routines, and projects. It offers features like task creation, organization, recurring tasks, and group management, with a focus on ease of use and scalability.

---

## **Access the Live Application**

You can access the live application at: **[TaskHub Live](http://www.sangsik.com/)**  

### How to Use:
1. Visit the provided link: **[http://www.sangsik.com/](http://www.sangsik.com/)**.  
2. Click the **"Use Developer Account"** button on the main page to explore the application's features.  
3. Start managing tasks, routines, and categories seamlessly.  

---

## **Key Features**

### Task Management
- **Create, update, and delete tasks**: Manage tasks with features like due dates (DoDates), parent-child relationships (Main and Sub Tasks), and task prioritization.  
- **Drag-and-drop support**: Rearrange tasks or change due dates visually.  
- **Filter tasks**: Sort tasks by status, category, or assigned work.  

### Routine Management
- Define **recurring tasks** with custom schedules (daily, weekly, monthly, yearly).  
- Add routines to task lists with a simple checkbox or "Add to List" button.  

### Category and Group Management
- **Organize tasks** into categories and groups for better management.  
- Update or delete categories and groups with tasks reassigned automatically when needed.  

### Comprehensive REST API
- Full-featured API for tasks, routines, categories, and groups.  
- Filter tasks by status, date, or category.  

---

## **Technology Stack**

### Backend
- **Java**: Core language for backend development.  
- **Spring Boot**: Framework for creating RESTful APIs and service layers.  
- **Hibernate/JPA**: ORM for database interactions.  

### Frontend
- **JavaScript**: Dynamic UI features such as drag-and-drop functionality.  
- **Thymeleaf** (optional): Template engine for server-side rendering.

### Database
- **MySQL**: Relational database for managing tasks, categories, routines, and groups.  

### Infrastructure
- **AWS EC2**: Hosts the application for scalable deployment.  
- **AWS RDS**: Manages the relational database for high availability and performance.  

### Tools
- **Maven**: Build and dependency management.  
- **Docker**: Containerization for consistent deployment.  
- **Postman**: API testing and documentation.  

---

## **Architecture**

### High-Level Architecture
```plaintext
User Interface (Frontend)
   |
   v
REST API (Spring Boot Controllers)
   |
   v
Service Layer (TaskhubService)
   |
   v
Database (AWS RDS via MySQL)
```

- **Frontend**: Handles user interactions, task creation, drag-and-drop, and filtering.  
- **Backend**: RESTful APIs built with Spring Boot manage business logic and interact with the database.  
- **Database**: Hosted on **AWS RDS**, storing tasks, categories, routines, and groups with indexing for performance.  
- **Infrastructure**: Application is deployed on **AWS EC2**, ensuring scalability and reliability.

---

## **API Documentation**

### **Task Management Endpoints**
| Method | Endpoint                        | Description                       |
|--------|---------------------------------|-----------------------------------|
| GET    | `/api/tasks/{hideCompleted}`    | Fetch tasks by completion status. |
| POST   | `/api/save`                     | Save a task, work, group, or routine. |
| PUT    | `/api/updateTask/{taskId}`      | Update a task.                    |
| DELETE | `/api/deleteTask/{taskId}`      | Delete a task.                    |

### **Routine Management Endpoints**
| Method | Endpoint                        | Description                       |
|--------|---------------------------------|-----------------------------------|
| GET    | `/api/findRoutines`             | Fetch all routines.               |
| POST   | `/api/saveRoutineToList`        | Add routines to the task list.    |
| DELETE | `/api/deleteRoutine/{routineId}`| Delete a routine.                 |

### **Category Management Endpoints**
| Method | Endpoint                        | Description                       |
|--------|---------------------------------|-----------------------------------|
| GET    | `/api/getCategories`            | Fetch all categories.             |
| POST   | `/api/insertCategory`           | Add a new category.               |
| DELETE | `/api/deleteCategory/{categoryId}` | Delete a category.               |

> Full API documentation is available in the `docs/api-endpoints.md` file.

---

## **Screenshots**

### Login
![image](https://github.com/user-attachments/assets/f5ed113d-030d-4d4b-bb04-1751ff2efa61)
### Task Management
![image](https://github.com/user-attachments/assets/de847092-4b9a-4369-91c2-043f238bf18c)
### Work Management
![image](https://github.com/user-attachments/assets/e17d76bf-5ee9-4810-b042-915a8a524b97)
### Routine Management
![image](https://github.com/user-attachments/assets/2ec2d911-54b4-4331-8174-10781cce8ea1)
