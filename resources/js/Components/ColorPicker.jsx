import { Popover, Transition } from '@headlessui/react';
import { Fragment, useState, useRef } from 'react';

const THEME_COLORS = [
    // White, Black, Light Gray, Blue-Gray, Blue, Orange, Gray, Yellow, Blue, Green
    ['#FFFFFF', '#000000', '#E7E6E6', '#44546A', '#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'],
    // Lighter 80%
    ['#F2F2F2', '#7F7F7F', '#D0CECE', '#D6DCE4', '#D9E2F3', '#FCE4D6', '#EDEDED', '#FFF2CC', '#DDEBF7', '#E2EFDA'],
    // Lighter 60%
    ['#D8D8D8', '#595959', '#AEAAAA', '#ADB9CA', '#B4C6E7', '#F8CBAD', '#DBDBDB', '#FFE699', '#BDD7EE', '#C6E0B4'],
    // Lighter 40%
    ['#BFBFBF', '#3F3F3F', '#757171', '#8497B0', '#8EA9DB', '#F4B084', '#C9C9C9', '#FFD966', '#9BC2E6', '#A9D08E'],
    // Darker 25%
    ['#A5A5A5', '#262626', '#3A3838', '#333F4F', '#2F5496', '#C65911', '#7B7B7B', '#BF9000', '#2F75B5', '#548235'],
    // Darker 50%
    ['#7F7F7F', '#0C0C0C', '#171616', '#222B35', '#1F3864', '#833C0C', '#525252', '#806000', '#1F4E79', '#375623'],
];

const STANDARD_COLORS = [
    '#C00000', '#FF0000', '#FFC000', '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0', '#002060', '#7030A0'
];

export default function ColorPicker({ editor }) {
    const inputRef = useRef(null);

    const setEditorColor = (color) => {
        if (color) {
            editor.chain().focus().setColor(color).run();
        } else {
            editor.chain().focus().unsetColor().run();
        }
    };

    const handleCustomColor = (e) => {
        setEditorColor(e.target.value);
    };

    const currentColor = editor.getAttributes('textStyle').color || '#000000';

    return (
        <Popover className="relative">
            {({ open, close }) => (
                <>
                    <Popover.Button
                        className={`p-1.5 rounded transition flex items-center gap-1 ${open ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                        title="Text Color"
                    >
                        <div className="flex flex-col items-center justify-center w-6">
                            <span className="font-serif font-bold text-lg leading-none" style={{ color: currentColor }}>A</span>
                            <div className="h-1 w-full mt-0.5" style={{ backgroundColor: currentColor }}></div>
                        </div>
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </Popover.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Popover.Panel className="absolute left-0 z-50 mt-1 w-64 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="p-1">
                                {/* Automatic */}
                                <button
                                    className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-900 rounded-sm mb-1 group"
                                    onClick={() => { setEditorColor(null); close(); }}
                                >
                                    <div className="w-5 h-5 border border-gray-300 bg-black mr-3 flex items-center justify-center">
                                        {!editor.getAttributes('textStyle').color && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span>Automatic</span>
                                </button>

                                {/* Theme Colors */}
                                <div className="px-2 py-1">
                                    <div className="text-xs font-semibold text-gray-500 mb-1">Theme Colors</div>
                                    <div className="grid grid-cols-10 gap-0.5">
                                        {THEME_COLORS.map((row, rowIndex) => (
                                            row.map((color, colIndex) => (
                                                <button
                                                    key={`${rowIndex}-${colIndex}`}
                                                    className="w-5 h-5 border border-transparent hover:border-orange-400 hover:bg-orange-100 hover:z-10 focus:outline-none focus:ring-1 focus:ring-orange-500 relative"
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => { setEditorColor(color); close(); }}
                                                    title={color}
                                                >
                                                </button>
                                            ))
                                        ))}
                                    </div>
                                </div>

                                {/* Standard Colors */}
                                <div className="px-2 py-1 mt-1 border-t border-gray-200">
                                    <div className="text-xs font-semibold text-gray-500 mb-1">Standard Colors</div>
                                    <div className="grid grid-cols-10 gap-0.5">
                                        {STANDARD_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                className="w-5 h-5 border border-transparent hover:border-orange-400 hover:bg-orange-100 hover:z-10 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                style={{ backgroundColor: color }}
                                                onClick={() => { setEditorColor(color); close(); }}
                                                title={color}
                                            >
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* More Colors */}
                                <div className="mt-1 border-t border-gray-200">
                                    <button
                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-900 rounded-b-md flex items-center gap-2"
                                        onClick={() => inputRef.current?.click()}
                                    >
                                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 border border-gray-200"></div>
                                        <span>More Colors...</span>
                                    </button>
                                    <input
                                        ref={inputRef}
                                        type="color"
                                        className="hidden"
                                        onChange={handleCustomColor}
                                    />
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}
