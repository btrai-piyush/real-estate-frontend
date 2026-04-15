"use client";

import LoginForm from "../login-form";
import RegisterForm from "../register-form";
import { useDispatch, useSelector } from "react-redux";
import {
  closeModal,
  selectModalOpen,
  selectModalTab,
  setModalTab,
} from "../../redux/authModal/authModalSlice";

export default function AuthModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectModalOpen);
  const activeTab = useSelector(selectModalTab);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#061018]/70 p-4 backdrop-blur-sm sm:p-6"
      onClick={() => dispatch(closeModal())}
    >
      <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <button
          onClick={() => dispatch(closeModal())}
          type="button"
          className="absolute -right-3 -top-3 z-50 grid h-11 w-11 place-items-center rounded-full bg-[#ff5a5f] text-white shadow-lg transition hover:bg-[#ff474d]"
          aria-label="Close auth modal"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_24px_90px_rgba(0,0,0,0.38)] md:flex-row">

          <aside className="relative hidden min-h-[680px] overflow-hidden md:block md:w-[44%]">
            <div
              className="absolute inset-0 bg-cover bg-center m-3 rounded-lg"
              style={{
                backgroundImage: "url('/waiting-room.jpg')",
              }}
            />
            <div className="relative flex h-full items-end p-8">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.16em] text-white-800">Real Estate</p>
                <h2 className="text-3xl font-semibold leading-tight text-white-800">{activeTab === "login" ? "Welcome back" : "Create your account"}</h2>
              </div>
            </div>
          </aside>

          <section className="flex w-full flex-col overflow-y-auto bg-[#fcfcfd] md:w-[56%]">
            <div className="border-b border-[#eceef4] p-4 sm:p-5">
              <div className="grid grid-cols-2 rounded-lg bg-[#f3f5fa] p-1">
                <button
                  onClick={() => dispatch(setModalTab("login"))}
                  type="button"
                  className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    activeTab === "login"
                      ? "bg-white text-[#111827] shadow-sm"
                      : "text-[#6b7280] hover:text-[#111827]"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => dispatch(setModalTab("register"))}
                  type="button"
                  className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    activeTab === "register"
                      ? "bg-white text-[#111827] shadow-sm"
                      : "text-[#6b7280] hover:text-[#111827]"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            <div className="flex-1 p-5 sm:p-7">
              {activeTab === "login" ? (
                <LoginForm
                  setTab={(tab) => dispatch(setModalTab(tab))}
                  onSuccess={() => dispatch(closeModal())}
                />
              ) : (
                <RegisterForm setTab={(tab) => dispatch(setModalTab(tab))} />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}