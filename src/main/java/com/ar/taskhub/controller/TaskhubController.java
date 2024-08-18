package com.ar.taskhub.controller;

import com.ar.taskhub.dto.TaskhubDTO;
import com.ar.taskhub.service.TaskhubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskhubController {
    private final TaskhubService taskhubService;

    @GetMapping("/save")
    public String save() {
        System.out.println(">>> TaskhubController.save 1");
        return "save";
    }

    @GetMapping("/tasksNotAssigned")
    public List<TaskhubDTO> getTasksNotAssigned() {
        return taskhubService.findAll();
    }

    @PostMapping("/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(@RequestParam(value = "task_content", required = false) String taskContent,
                                                    @RequestParam(value = "work_name", required = false) String workName,
                                                    @RequestParam("action") String action) {
        System.out.println(">>> TaskhubController.save 2 Action: "+ action);

        TaskhubDTO taskhubDTO = new TaskhubDTO();

        if ("TASK+".equals(action)) {
            taskhubDTO.setTask_content(taskContent);
        } else if ("WORK+".equals(action)) {
            taskhubDTO.setWork_name(workName);
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Invalid action"));
        }

        taskhubService.save(taskhubDTO);

        // Return a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Task or Work saved successfully.");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/tasks")
    public List<TaskhubDTO> getTasksByDateRange(@RequestParam(value = "baseDate", required = false) String baseDate) {
        LocalDate today;

        if (baseDate != null && !baseDate.isEmpty()) {
            today = LocalDate.parse(baseDate); // 문자열을 LocalDate로 변환
            System.out.println("baseDate passed::: "+baseDate);
            System.out.println("baseDate parsed::: "+today);
        } else {
            today = LocalDate.now(); // baseDate가 없으면 현재 날짜를 사용
            System.out.println("baseDate is null");
        }

        LocalDate monday = getMonday(today);
        LocalDate sunday = getSunday(today);
        String mon = formatDate(monday);
        String sun = formatDate(sunday);

        return taskhubService.findByDoDates(mon, sun);
    }



    @GetMapping("/tasksAdded")
    public List<TaskhubDTO> getTasks() {
        return taskhubService.findAll();
    }

    @GetMapping("/newId")
    public int findNewId() {
        return taskhubService.findNewId();
    }

    @GetMapping("/findById/{task_id}")
    public TaskhubDTO findById(@PathVariable("task_id") String taskId) {
        System.out.println("Fetching task details for ID: " + taskId);
        return taskhubService.findById(taskId);
    }

    @PostMapping("/updateTask/{taskId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateTask(@PathVariable("taskId") String taskId,
                                                          @RequestBody TaskhubDTO taskhubDTO) {
        System.out.println(">>> TaskhubController.updateTask taskid: "+taskId);
        System.out.println("TaskhubDTO: " + taskhubDTO);

        // Set the task ID in the DTO and update the task
        taskhubDTO.setTask_id(taskId);
        taskhubService.updateTask(taskhubDTO);

        // Return a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Task updated successfully.");

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deleteTask/{taskId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteTask(@PathVariable("taskId") String taskId) {
        System.out.println(">>> TaskhubController.deleteTask");
        System.out.println("Task ID: " + taskId);

        try {
            // Call the service layer to delete the task
            taskhubService.deleteTask(taskId);

            // Return a JSON response
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Task deleted successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Handle error (e.g., task not found)
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to delete task. Task might not exist.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/categories")
    public List<TaskhubDTO> getCategories() {
        return taskhubService.getCategories();
    }

    // 현재 날짜를 기준으로 해당 주의 월요일 날짜를 구하는 메소드
    public static LocalDate getMonday(LocalDate date) {
        return date.with(DayOfWeek.MONDAY);
    }

    // 현재 날짜를 기준으로 해당 주의 일요일 날짜를 구하는 메소드
    public static LocalDate getSunday(LocalDate date) {
        return date.with(DayOfWeek.SUNDAY);
    }
    // 날짜를 문자열로 포맷하는 메소드
    public static String formatDate(LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return date.format(formatter);
    }
}
