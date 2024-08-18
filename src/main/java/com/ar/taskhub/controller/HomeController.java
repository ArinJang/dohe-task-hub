package com.ar.taskhub.controller;

import com.ar.taskhub.dto.TaskhubDTO;
import com.ar.taskhub.service.TaskhubService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

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

    @GetMapping("/")
    public String index(Model model) {
        System.out.println(">>> HomeController.index");

        // Fetch all tasks
        List<TaskhubDTO> taskhubDTOList = taskhubService.findAll();
        model.addAttribute("taskhubList", taskhubDTOList);

        return "index";
    }
}
