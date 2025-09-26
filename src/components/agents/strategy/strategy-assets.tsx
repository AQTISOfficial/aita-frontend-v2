import React, { useState } from "react";
import { assets as tokenData } from "@/lib/assets";
import { FormChangeHandler } from "@/lib/types"

type StrategyAssetsProps = {
  formData: { assets: string };
  handleChange: FormChangeHandler;
  error?: string;
};

const StrategyAssets: React.FC<StrategyAssetsProps> = ({ formData, handleChange, error }) => {
  const [selectedValue, setSelectedValue] = useState<string>(formData.assets || "");
  const [search, setSearch] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.toLowerCase().trim());
  };

  const handleValueChange = (value: string) => {
    const formattedValue = value.replace(" ", "_");
    setSelectedValue(formattedValue);
    handleChange({ target: { name: "assets", value } });
    setSearch("");
  };

  // Filter tokens based on search
  const filteredTokens = Object.entries(tokenData).reduce((acc, [category, tokens]) => {
    const matchedTokens = tokens.filter(
      (token) =>
        token.toLowerCase().includes(search) || category.toLowerCase().includes(search)
    );
    if (matchedTokens.length > 0) {
      acc[category] = matchedTokens;
    }
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="relative flex flex-col p-4">
      {/* Search Input */}
      <input
        type="text"
        name="assets"
        autoComplete="off"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search tokens or categories..."
        className="input-field antialiased text-sm p-2 border border-neutral-700 rounded-md w-full focus:outline-none focus:ring-0 tracking-wide "
      />

      {/* Selected value */}
      {selectedValue && (
        <div className="my-4">
          <span className="text-neutral-400">Selected:</span>
          <span className="text-neutral-100 font-bold ml-2 capitalize">
            {selectedValue.replaceAll("_", " ")}
          </span>
        </div>
      )}

      {/* Dropdown List */}
      {(search || Object.keys(filteredTokens).length > 0) && (
        <div className="p-4 mt-1 bg-neutral-950 text-white rounded-xl border border-neutral-800 shadow-lg max-h-96 overflow-y-auto z-10">
          {Object.keys(filteredTokens).length > 0 ? (
            Object.entries(filteredTokens).map(([category, tokens]) => (
              <div key={category} className="p-0 mb-6">
                <span
                  className="p-2 text-base flex text-white items-center justify-center rounded-md bg-neutral-900 border border-neutral-800 capitalize cursor-pointer"
                  onClick={() => handleValueChange(category)}
                >
                  {category.replaceAll("_", " ")}
                </span>
                <div className="grid grid-cols-5 gap-2 my-2">
                  {tokens.map((token) => (
                    <div
                      key={token}
                      className="p-2 text-sm flex items-center justify-center text-neutral-400 cursor-pointer hover:text-white"
                      onClick={() => handleValueChange(token)}
                    >
                      {token}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-400">No matches found</div>
          )}
        </div>
      )}

      {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}
    </div>
  );
};

export default StrategyAssets;
