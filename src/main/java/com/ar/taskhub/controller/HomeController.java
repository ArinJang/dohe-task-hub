package com.ar.taskhub.controller;

import com.ar.taskhub.dto.TaskhubDTO;
import com.ar.taskhub.dto.UserDTO;
import com.ar.taskhub.service.TaskhubService;
import com.ar.taskhub.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class HomeController {
    private final TaskhubService taskhubService;
    private final UserService userService;

    @GetMapping("/")
    public String index(Model model, HttpSession session) {
        System.out.println(">>> HomeController <<<");
//        TaskhubDTO taskhubDTO = new TaskhubDTO();
//        taskhubDTO.setUser_id((long) 2); // admin 계정의 user_id로 고정

        // Fetch all tasks
//        List<TaskhubDTO> taskhubDTOList = taskhubService.findAllfromHome(2L);
//        model.addAttribute("taskhubList", taskhubDTOList);

        return "index";
    }

}
