import React, { useEffect, useRef, useState } from "react";
import { Layout } from "antd";
import { useNavigate } from "react-router-dom";
import { Profile, TodoDashboard, DashboardHeader } from "./components";
import { signOutUser } from "../../library";
import { handleErrorFromEmailLogin } from "../../utils/helperFunctions";
import "./components/style.css";
import {
  addTaskInDatabase,
  updateTaskTitleInDatabase,
  updateTaskStatusInDatabase,
  deleteTaskInDatabase,
  getTasksFromDatabase,
} from "../../library";

const { Header, Sider, Content } = Layout;

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [tasks, setTasks] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [selectedTask, setSelectedTask] = useState({});
  const [isEditEnabled, setIsEditEnabled] = useState(false);

  const inputRef = useRef(null);
  const readDatabase = getTasksFromDatabase(user.uid);

  console.log(readDatabase);

  const onHandleChange = (name, value) => {
    switch (name) {
      case "newTask":
        setNewTaskInput(value);
        break;
      default:
        return;
    }
  };

  const onEnterPressedOnTaskInput = (e) => {
    if (e.key === "Enter" && newTaskInput.length) {
      onAddClickHandler();
    }
  };
  const onAddClickHandler = () => {
    const taskData = {
      id: tasks.length + 1,
      title: newTaskInput,
      status: "pending",
    };
    addTaskInDatabase(user.uid, taskData);

    setTasks([taskData, ...tasks]);
    setNewTaskInput("");
  };

  const onClickLogout = () => {
    signOutUser()
      .then((data) => {
        localStorage.removeItem("user");
        navigate("/");
      })
      .catch((err) => {
        handleErrorFromEmailLogin(err.code, err.message);
      });
  };

  const onEditClickHandler = (task) => {
    setSelectedTask(task);
    setIsEditEnabled(true);
    setNewTaskInput(task.title);
    setTasks(tasks.filter((taskItem) => taskItem.id !== task.id));
  };

  const onSaveChangesClickHandler = () => {
    updateTaskTitleInDatabase(user.uid, selectedTask.id, newTaskInput);
    setTasks([{ ...selectedTask, title: newTaskInput }, ...tasks]);
    setIsEditEnabled(false);
    setNewTaskInput("");
    setSelectedTask({});
  };

  const onCancelSaveChanges = () => {
    setTasks([{ ...selectedTask }, ...tasks]);
    setIsEditEnabled(false);
    setNewTaskInput("");
    setSelectedTask({});
  };

  const changeTaskToProgress = (id) => {
    updateTaskStatusInDatabase(user.uid, id, "progress");
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return { ...task, status: "progress" };
        }
        return { ...task };
      })
    );
  };

  const changeTaskToDone = (id) => {
    updateTaskStatusInDatabase(user.uid, id, "done");
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return { ...task, status: "done" };
        }
        return { ...task };
      })
    );
  };

  const deleteATask = (id) => {
    deleteTaskInDatabase(user.uid, id);
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const focusOnNewTaskInput = () => {
    inputRef.current.focus();
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        width={300}
        className="whiteBgColor"
        style={{ borderRight: "2px solid #b2bec3" }}
      >
        <Profile user={user} onClickLogout={onClickLogout} />
      </Sider>
      <Layout>
        <Header>
          <DashboardHeader />
        </Header>
        <Content className="whiteBgColor">
          <TodoDashboard
            tasks={tasks}
            inputRef={inputRef}
            newTaskInput={newTaskInput}
            isEditEnabled={isEditEnabled}
            deleteATask={deleteATask}
            onHandleChange={onHandleChange}
            changeTaskToDone={changeTaskToDone}
            onAddClickHandler={onAddClickHandler}
            onEditClickHandler={onEditClickHandler}
            onCancelSaveChanges={onCancelSaveChanges}
            focusOnNewTaskInput={focusOnNewTaskInput}
            changeTaskToProgress={changeTaskToProgress}
            onSaveChangesClickHandler={onSaveChangesClickHandler}
            onEnterPressedOnTaskInput={onEnterPressedOnTaskInput}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;

/*
{
  id,
  title,
  status: pending | progress | done,
}
*/
