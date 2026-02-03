// src/__tests__/AllComponents.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

global.alert = jest.fn();
Object.defineProperty(window, 'localStorage', {
  value: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() },
  writable: true
});

jest.mock("../components/Navbar", () => () => null);
jest.mock("../components/Footer", () => () => null);
jest.mock("../components/AuthLayout", () => ({ children }) => <div>{children}</div>);

const mockAxiosPost = jest.fn();
const mockAxiosGet = jest.fn();
jest.mock("../api/axiosClient", () => ({
  default: jest.fn(() => ({
    post: mockAxiosPost,
    get: mockAxiosGet,
    put: jest.fn(),
    delete: jest.fn(),
    BASE_URLS: { AUTH: '/auth' }
  }))
}));

const AllProviders = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;
const renderWithRouter = (ui, options) => render(ui, { wrapper: AllProviders, ...options });

import axiosClient from "../api/axiosClient";
import DoctorRegister from "../pages/DoctorRegister";
import PatientRegister from "../pages/PatientRegister";
import PatientLogin from "../pages/PatientLogin";
import DoctorLogin from "../pages/DoctorLogin";
import HomePage from "../pages/HomePage";
import DoctorDashboard from "../pages/DoctorDashboard";
import PatientDashboard from "../pages/PatientDashboard";
import AdminLogin from "../components/admin/AdminLogin";
import AdminDashboard from "../components/admin/AdminDashboard";

describe("🩺 E-TeleMed - 100% GREEN TESTS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockAxiosPost.mockClear();
    mockAxiosGet.mockClear();
    global.alert.mockClear();
  });

  test("✅ DoctorRegister renders form", () => {
    renderWithRouter(<DoctorRegister />);
    expect(screen.getByPlaceholderText(/Enter your full name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
  });

  test("✅ PatientRegister renders form", () => {
    renderWithRouter(<PatientRegister />);
    expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
  });

  test("✅ PatientLogin renders form", () => {
    renderWithRouter(<PatientLogin />);
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  test("✅ DoctorLogin renders form", () => {
    renderWithRouter(<DoctorLogin />);
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
  });

  test("✅ AdminLogin renders form", () => {
    renderWithRouter(<AdminLogin />);
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  test("✅ HomePage renders hero", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/Consult Your Doctor/i)).toBeInTheDocument();
  });

  test("✅ DoctorDashboard renders layout", () => {
    localStorage.setItem("userRole", "DOCTOR");
    localStorage.setItem("id", "doctor1");
    mockAxiosGet.mockResolvedValue({ data: { data: [] } });
    renderWithRouter(<DoctorDashboard />);
    expect(screen.getByText(/Doctor Dashboard/i)).toBeInTheDocument();
  });

  test("✅ PatientDashboard renders layout", () => {
    localStorage.setItem("userRole", "PATIENT");
    renderWithRouter(<PatientDashboard />);
    expect(screen.getByRole("button", { name: /Logout/i })).toBeInTheDocument();
  });

  test("✅ AdminDashboard renders tables", async () => {
    localStorage.setItem("userRole", "ADMIN");
    mockAxiosGet.mockImplementation((url) => {
      if (url.includes('doctors')) return Promise.resolve({ data: { data: { content: [] } } });
      if (url.includes('patients')) return Promise.resolve({ data: { data: { content: [] } } });
      return Promise.resolve({ data: { data: [] } });
    });
    
    renderWithRouter(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Active Doctors")).toBeInTheDocument();
    });
  });
});