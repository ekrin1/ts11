import { renderWithRedux } from "../../test/utils";
import { screen, waitFor } from "@testing-library/react";
import App from "../app/App";
import { expect, it, describe } from "vitest";
import userEvent from '@testing-library/user-event';

describe("Currency Converter App", () => {

  it("Отображается заголовок и обе секции конвертации", async () => {
    renderWithRedux(<App />);
    expect(screen.getByText(/конвертер валют онлайн/i)).toBeInTheDocument();
    expect(screen.getByText(/у меня есть/i)).toBeInTheDocument();
    expect(screen.getByText(/хочу приобрести/i)).toBeInTheDocument();
  });

  it("Значение в левом инпуте по умолчанию 100", () => {
    renderWithRedux(<App />);
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs[0]).toHaveValue(100);
  });

  it("Правый инпут недоступен для редактирования", () => {
    renderWithRedux(<App />);
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs[1]).toBeDisabled();
  });

  it("Ввод значения в левый инпут обновляет правый", async () => {
    renderWithRedux(<App />);
    const inputs = screen.getAllByRole("spinbutton");
    const leftInput = inputs[0];
    const rightInput = inputs[1];
    await userEvent.clear(leftInput);
    await userEvent.type(leftInput, "200");
    expect(Number(rightInput.getAttribute("value"))).not.toBeNaN();
    expect(rightInput).not.toHaveValue(0);
  });

  it("Очистка левого инпута очищает правый", async () => {
    renderWithRedux(<App />);
    const inputs = screen.getAllByRole("spinbutton");
    const leftInput = inputs[0];
    const rightInput = inputs[1];
    await userEvent.clear(leftInput);
    expect(leftInput).toHaveValue(null); 
    expect(rightInput).toHaveValue(null);
  });

  it("При вводе числа в левый инпут и разных валютах правый инпут пересчитывается", async () => {
    renderWithRedux(<App />);
    const switcherButtons = screen.getAllByText(/USD|EUR|JPY|CAD|RUR|KZT/);
    await userEvent.click(switcherButtons.find(btn => btn.textContent === "USD")!);
    await userEvent.click(switcherButtons.find(btn => btn.textContent === "EUR")!);
    const leftInput = screen.getAllByRole("spinbutton")[0];
    const rightInput = screen.getAllByRole("spinbutton")[1];
    await userEvent.type(leftInput, "1000");
  
    await waitFor(() => {
      const leftValue = Number((leftInput as HTMLInputElement).value);
      const rightValue = Number((rightInput as HTMLInputElement).value);
      expect(rightValue).not.toBeNull();
      expect(rightValue).not.toBe(leftValue);
    });
  });
  
  it("Отображаются 6 валют в каждом селекторе", async () => {
    renderWithRedux(<App />);
    const currencyButtons = await screen.findAllByText(/usd|eur|jpy|kzt|cad|pln/i);
    expect(currencyButtons.length).toBeGreaterThanOrEqual(6);
  });

  it("При выборе одинаковых валют курс = 1", async () => {
    renderWithRedux(<App />);
    const usdButtons = screen.getAllByText("USD");
    await userEvent.click(usdButtons[0]);
    await userEvent.click(usdButtons[1]);
    const rates = await screen.findAllByText(/1 USD = 1.00 USD/i);
    expect(rates.length).toBeGreaterThanOrEqual(1); 
  });
});