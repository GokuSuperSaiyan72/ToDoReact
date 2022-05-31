import React, { useEffect, useState } from "react";
import { Button, Card, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";
import "./style.css";
import {
  signInWithEmailPassword,
  createUserWithEmailPassword,
  signInWithGoogle,
  checkIfUserExist,
  addUserInDatabase,
} from "../../../library";
import { showMessage } from "../../../library/messages";
import {
  handleErrorFromEmailLogin,
  isEmailValid,
} from "../../../utils/helperFunctions";

const Login = () => {
  const [email, setEmail] = useState("abhishek@gmail.com");
  const [password, setPassword] = useState("abhishek");
  const [validationError, setValidationError] = useState({});
  const [confirmPassword, setConfirmPassword] = useState("abhishek");
  const [isSignupEnabled, setIsSignupEnabled] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoadingSigning, setIsLoadingSigning] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (email.length) {
      const isValidEmail = isEmailValid(email);
      setValidationError({
        ...validationError,
        emailError: isValidEmail ? "" : "Enter a valid email!",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    if (isSignupEnabled && confirmPassword.length) {
      setValidationError({
        ...validationError,
        confirmPasswordError:
          password !== confirmPassword
            ? "Enter password matching above entered password"
            : "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmPassword]);

  const setUserInLocalStorage = (userInfo) => {
    const {
      user: { uid, email, picture, name, accessToken },
    } = userInfo;
    const userData = { uid, email, name, picture, accessToken };
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const onLoginClickHandler = async () => {
    setIsLoadingSigning(true);
    if (isSignupEnabled) {
      createUserWithEmailPassword(email, password)
        .then((data) => {
          addUserInDatabase(data.user.uid, {
            email: data.user.email,
            auth_provider: "email",
          })
            .then((_) => {
              setUserInLocalStorage(data);
              navigate("/home");
            })
            .catch((err) => {
              setIsLoadingSigning(false);
              handleErrorFromEmailLogin(err.code, err.message);
            });
          setIsLoadingSigning(false);
        })
        .catch((err) => {
          setIsLoadingSigning(false);
          handleErrorFromEmailLogin(err.code, err.message);
        });
    } else {
      signInWithEmailPassword(email, password)
        .then((data) => {
          setUserInLocalStorage(data);
          setIsLoadingSigning(false);
          navigate("/home");
        })
        .catch((err) => {
          if (err.code === "auth/user-not-found") {
            setIsSignupEnabled(true);
          }
          setIsLoadingSigning(false);
          handleErrorFromEmailLogin(err.code, err.message);
        });
    }
  };

  const onLoginWithGoogleClickHandler = async () => {
    setIsGoogleLoading(true);
    signInWithGoogle()
      .then(async (data) => {
        const doesExist = await checkIfUserExist(data.user.uid);
        const userData = {
          user: {
            uid: data.user.uid,
            email: data.additionalUserInfo.profile.email,
            name: data.additionalUserInfo.profile.name,
            picture: data.additionalUserInfo.profile.picture,
            auth_provider: "google",
            accessToken: data.credential.accessToken,
          },
        };
        setUserInLocalStorage(userData);
        if (!doesExist) {
          await addUserInDatabase(data.user.uid, { ...userData.user });
          return navigate("/home");
        }

        return navigate("/home");
      })
      .catch((err) => {
        showMessage("error", err.message);
      })
      .finally(() => {
        setIsGoogleLoading(false);
      });
  };

  return (
    <div className="LoginPageContainer">
      <Card
        style={{ flex: 0.6 }}
        className="br10 flex justifyContentCenter"
        hoverable
      >
        <h2 className="poppinsBold flex justifyContentCenter">Login...</h2>
        <div className="flex justifyContentCenter">
          <div>
            <Input
              value={email}
              status={
                validationError.emailError && validationError.emailError.length
                  ? "error"
                  : ""
              }
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              type="email"
              placeholder="Enter email"
            />
            <Input.Password
              value={password}
              placeholder="enter password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              onChange={(e) => setPassword(e.target.value)}
              className="mt12"
            />
            {isSignupEnabled && (
              <Input.Password
                value={confirmPassword}
                status={
                  validationError.confirmPasswordError &&
                  validationError.confirmPasswordError.length
                    ? "error"
                    : ""
                }
                placeholder="confirm password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                className="mt12"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            <div className="mv12 errorText">
              {validationError.emailError &&
              validationError.emailError.length ? (
                <p>{validationError.emailError}</p>
              ) : validationError.confirmPasswordError &&
                validationError.confirmPasswordError.length ? (
                <p>{validationError.confirmPasswordError}</p>
              ) : null}
            </div>

            <Button
              type="primary"
              className="width100"
              loading={isLoadingSigning}
              onClick={onLoginClickHandler}
              disabled={
                !email || !password || (isSignupEnabled && !confirmPassword)
              }
            >
              {isSignupEnabled ? "Create an account" : "Login"}
            </Button>
          </div>
        </div>
        <div className="flex flexRow alignItemsCenter justifyContentCenter mv12">
          <hr style={{ flex: 0.45 }} />
          <h3>or</h3>
          <hr style={{ flex: 0.45 }} />
        </div>
        <Button
          type="primary"
          className="width100"
          loading={isGoogleLoading}
          onClick={onLoginWithGoogleClickHandler}
        >
          Login with google
        </Button>
      </Card>
    </div>
  );
};

export default Login;
