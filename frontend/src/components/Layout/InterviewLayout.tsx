import { useState, useRef, useEffect, ReactNode } from 'react';
import { GripVertical } from 'lucide-react';

interface InterviewLayoutProps {
    leftPanel: ReactNode;
    centerPanel: ReactNode;
    rightPanel: ReactNode;
}

export function InterviewLayout({ leftPanel, centerPanel, rightPanel }: InterviewLayoutProps) {
    // Default widths in percentages. 
    // Left starts at ~20% (col-span-2 / 12), Right at ~25% (col-span-3 / 12)
    const [leftWidth, setLeftWidth] = useState(20);
    const [rightWidth, setRightWidth] = useState(25);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingLeft = useRef(false);
    const isDraggingRight = useRef(false);

    // Drag handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const containerWidth = containerRect.width;

            // Calculate mouse position as percentage of container
            // (e.clientX - containerRect.left) gives x position relative to container
            const mouseX = e.clientX - containerRect.left;
            const mousePercentage = (mouseX / containerWidth) * 100;

            if (isDraggingLeft.current) {
                // Limit left panel width between 15% and 40%
                const newWidth = Math.max(15, Math.min(40, mousePercentage));
                setLeftWidth(newWidth);
            }

            if (isDraggingRight.current) {
                // For right panel, width is from right edge. 
                // Mouse pos for right handle is at (100 - rightWidth)%
                // So newRightWidth = 100 - mousePercentage
                const newWidth = Math.max(20, Math.min(45, 100 - mousePercentage));
                setRightWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            isDraggingLeft.current = false;
            isDraggingRight.current = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startResizeLeft = () => {
        isDraggingLeft.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    };

    const startResizeRight = () => {
        isDraggingRight.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    };

    return (
        <div className="h-[calc(100vh-4rem)] p-4 md:p-6 overflow-hidden relative">
            <div
                ref={containerRef}
                className="max-w-[1920px] mx-auto h-full flex flex-col lg:flex-row gap-0 overflow-hidden"
            >

                {/* Left Panel (Setup) */}
                <div
                    className="lg:h-full flex flex-col min-h-[300px] lg:min-h-0 shrink-0 transition-[width] duration-0 ease-linear w-full lg:w-[var(--left-width)]"
                    style={{ '--left-width': `${leftWidth}%` } as React.CSSProperties}
                >
                    <div className="h-full w-full pr-2">
                        {leftPanel}
                    </div>
                </div>

                {/* Resizer Left (Desktop Only) */}
                <div
                    className="hidden lg:flex w-4 cursor-col-resize items-center justify-center hover:bg-white/10 transition-colors group z-10"
                    onMouseDown={startResizeLeft}
                >
                    <div className="w-1 h-8 bg-border/50 rounded-full group-hover:bg-hirebyte-mint/50 transition-colors flex items-center justify-center">
                        <GripVertical size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </div>
                </div>

                {/* Center Panel (Video) - Takes remaining space */}
                <div className="flex-1 min-w-[300px] h-full min-h-0 flex flex-col">
                    {centerPanel}
                </div>

                {/* Resizer Right (Desktop Only) */}
                <div
                    className="hidden lg:flex w-4 cursor-col-resize items-center justify-center hover:bg-white/10 transition-colors group z-10"
                    onMouseDown={startResizeRight}
                >
                    <div className="w-1 h-8 bg-border/50 rounded-full group-hover:bg-hirebyte-mint/50 transition-colors flex items-center justify-center">
                        <GripVertical size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </div>
                </div>

                {/* Right Panel (Chat) */}
                <div
                    className="lg:h-full flex flex-col min-h-[400px] lg:min-h-0 shrink-0 transition-[width] duration-0 ease-linear w-full lg:w-[var(--right-width)]"
                    style={{ '--right-width': `${rightWidth}%` } as React.CSSProperties}
                >
                    <div className="h-full w-full pl-2">
                        {rightPanel}
                    </div>
                </div>

            </div>
        </div>
    );
}
