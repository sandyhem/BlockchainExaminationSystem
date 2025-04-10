import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCircleQuestion, faEye } from "@fortawesome/free-solid-svg-icons";
import "../../css/Exam.css";

// 🕒 Format time in hh:mm:ss
const formatTime = (seconds) => {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

const ExamCard = ({ exams, updateTimer }) => {
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const initialTimers = {};
    exams.forEach((exam) => {
      initialTimers[exam.examId] = exam.duration || 3600; 
    });
    setTimers(initialTimers);
  }, [exams]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updated = {};
        for (const key in prevTimers) {
          updated[key] = Math.max(prevTimers[key] - 1, 0);
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  const setTimeForExam = (examId, timeInSeconds) => {
    setTimers((prev) => ({
      ...prev,
      [examId]: timeInSeconds,
    }));
  };

  const handleClick = (id) => {
    alert(`This will open the file for Exam ID: ${id}`);
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-primary fw-bold">Available Exams</h3>
      <div className="row g-4">
        {exams.map((exam) => (
          <div key={exam.examId} className="col-lg-4 col-md-6">
            <div
              className="exam-card card h-100 shadow-sm"
              onClick={() => handleClick(exam.examId)}
            >
              <div className="card-header bg-primary text-white py-3">
                <h6 className="mb-0 fw-bold">Exam ID: {exam.examId}</h6>
              </div>
              <div className="card-body d-flex flex-column">
                <div className="icon-container text-center mb-3">
                  <div className="icon-circle">
                    <FontAwesomeIcon
                      icon={faFileCircleQuestion}
                      className="text-primary"
                      size="2x"
                    />
                  </div>
                </div>
                <h5 className="card-title fw-bold text-center">{exam.name}</h5>
                <p className="card-text text-muted text-center mb-3">
                  {exam.subject}
                </p>

                {/* 🕒 Timer */}
                <div className="text-center mb-3">
                  <div
                    className={`digital-timer ${
                      timers[exam.examId] <= 300 ? "warning" : ""
                    }`}
                  >
                    ⏱ {formatTime(timers[exam.examId] || 0)}
                  </div>
                </div>

                <div className="mt-auto text-center">
                  <button className="btn btn-outline-primary btn-sm view-btn">
                    <FontAwesomeIcon icon={faEye} className="me-2" />
                    View Exam
                  </button>
                </div>
              </div>
              <div className="card-footer text-muted bg-light py-2">
                <small>Click to open exam details</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamCard;
