import { useEffect, useRef, useState } from "react";

export default function ComboboxSelect({ value, onChange, options, placeholder, disabled }) {
    const [query, setQuery] = useState(value || "");
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setQuery(value || "");
    }, [value]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                // If user typed something not in list, keep the free-text value
                if (query !== value) {
                    onChange(query);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [query, value, onChange]);

    const filtered = query
        ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
        : options;

    function handleInputChange(e) {
        setQuery(e.target.value);
        onChange(e.target.value);
        setOpen(true);
    }

    function handleSelect(option) {
        setQuery(option);
        onChange(option);
        setOpen(false);
    }

    function handleKeyDown(e) {
        if (e.key === "Escape") {
            setOpen(false);
        }
    }

    return (
        <div ref={containerRef} className="combobox-select" style={{ position: "relative" }}>
            <input
                ref={inputRef}
                type="text"
                value={query}
                placeholder={placeholder}
                disabled={disabled}
                onChange={handleInputChange}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={open}
            />
            {open && filtered.length > 0 && (
                <ul className="combobox-select__dropdown" role="listbox">
                    {filtered.map((option) => (
                        <li
                            key={option}
                            role="option"
                            aria-selected={option === value}
                            className={option === value ? "combobox-select__option combobox-select__option--selected" : "combobox-select__option"}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(option);
                            }}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
