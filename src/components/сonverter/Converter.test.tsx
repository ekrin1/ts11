import { renderWithRedux } from "../../test/utils";
import { screen, fireEvent } from "@testing-library/react";
import App from "../app/App";
import { expect, it, describe } from "vitest";
import { within } from "@testing-library/react";

describe("Converter Functional Tests", () => {

  it("Отображается заголовок приложения", () => {
    renderWithRedux(<App />);
    expect(screen.getByText(/Конвертер валют онлайн/i)).toBeInTheDocument();
  });

  it("Отображаются хотя бы 6 валют", async () => {
    renderWithRedux(<App />);
    const selects = await screen.findAllByRole("combobox");
    const leftSelectOptions = within(selects[0]).getAllByRole("option");
    expect(leftSelectOptions.length).toBeGreaterThanOrEqual(6);
  });

  it("Значение в левом инпуте по умолчанию - 100", () => {
    renderWithRedux(<App />);
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs[0]).toHaveValue(100);
  });

  it("Правый инпут недоступен для редактирования", () => {
    renderWithRedux(<App />);
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs[1]).toBeDisabled();
  });

  it("При вводе в левый инпут - правый пересчитывается", async () => {
    renderWithRedux(<App />);
    const inputs = screen.getAllByRole("spinbutton");
  
    const leftInput = inputs[0] as HTMLInputElement;
    const rightInput = inputs[1] as HTMLInputElement;
  
    fireEvent.change(leftInput, { target: { value: "200" } });
    
    expect(Number(rightInput.value)).toBeGreaterThan(100);
  });

  it("При смене валют курс пересчитывается", async () => {
    renderWithRedux(<App />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "EUR" } });
    fireEvent.change(selects[1], { target: { value: "JPY" } });
    const rateText = await screen.findByText(/1 EUR =/i);
    expect(rateText.textContent).toContain("JPY");
  });

  it("Если выбрать одинаковую валюту, курс = 1", async () => {
    renderWithRedux(<App />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "USD" } });
    fireEvent.change(selects[1], { target: { value: "USD" } });
    expect(await screen.findByText("1 USD = 1.00 USD")).toBeInTheDocument();
  });

  it("При нажатии на кнопку обмена - валюты меняются местами", async () => {
    renderWithRedux(<App />);
    const selects = screen.getAllByRole("combobox");
    const leftSelect = selects[0] as HTMLSelectElement;
    const rightSelect = selects[1] as HTMLSelectElement;
    const initialLeft = leftSelect.value;
    const initialRight = rightSelect.value;

    const swapButton = screen.getByRole("button", { name: "swap" });
    fireEvent.click(swapButton);

    expect(leftSelect.value).toBe(initialRight);
    expect(rightSelect.value).toBe(initialLeft);
  });
});
