// Touch Control Customizer
// Allows players to customize their mobile control layout

export class TouchControlCustomizer {
    constructor(k, touchControls) {
        this.k = k;
        this.touchControls = touchControls;
        this.isCustomizing = false;
        this.customLayout = this.loadCustomLayout();
        
        // Default positions (percentage-based for responsiveness)
        this.defaultLayout = {
            joystick: { x: 0.15, y: 0.85 },
            jumpZone: { x: 0.75, y: 0.5, width: 0.25, height: 0.5 },
            restart: { x: 0.85, y: 0.1 },
            home: { x: 0.92, y: 0.1 },
            music: { x: 0.78, y: 0.1 }
        };
        
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
    }
    
    loadCustomLayout() {
        const saved = localStorage.getItem('touchControlLayout');
        return saved ? JSON.parse(saved) : null;
    }
    
    saveCustomLayout() {
        localStorage.setItem('touchControlLayout', JSON.stringify(this.customLayout));
    }
    
    startCustomization() {
        this.isCustomizing = true;
        
        // Create customization UI
        this.createCustomizationOverlay();
        
        // Make controls draggable
        this.makeControlsDraggable();
    }
    
    createCustomizationOverlay() {
        // Semi-transparent background
        this.overlay = this.k.add([
            this.k.rect(this.k.width(), this.k.height()),
            this.k.pos(0, 0),
            this.k.fixed(),
            this.k.z(5000),
            this.k.color(0, 0, 0),
            this.k.opacity(0.7),
            "customizeOverlay"
        ]);
        
        // Instructions
        this.instructions = this.k.add([
            this.k.text("Drag controls to customize layout", { size: 24 }),
            this.k.pos(this.k.width() / 2, 50),
            this.k.anchor("center"),
            this.k.fixed(),
            this.k.z(5001),
            this.k.color(255, 255, 255),
            "customizeInstructions"
        ]);
        
        // Save button
        this.saveButton = this.k.add([
            this.k.rect(120, 40),
            this.k.pos(this.k.width() / 2 - 130, this.k.height() - 60),
            this.k.fixed(),
            this.k.z(5001),
            this.k.color(0, 200, 0),
            this.k.area(),
            "saveCustomization"
        ]);
        
        this.saveText = this.k.add([
            this.k.text("Save", { size: 20 }),
            this.k.pos(this.k.width() / 2 - 130 + 60, this.k.height() - 40),
            this.k.anchor("center"),
            this.k.fixed(),
            this.k.z(5002),
            this.k.color(255, 255, 255),
            "saveText"
        ]);
        
        // Cancel button
        this.cancelButton = this.k.add([
            this.k.rect(120, 40),
            this.k.pos(this.k.width() / 2 + 10, this.k.height() - 60),
            this.k.fixed(),
            this.k.z(5001),
            this.k.color(200, 0, 0),
            this.k.area(),
            "cancelCustomization"
        ]);
        
        this.cancelText = this.k.add([
            this.k.text("Cancel", { size: 20 }),
            this.k.pos(this.k.width() / 2 + 10 + 60, this.k.height() - 40),
            this.k.anchor("center"),
            this.k.fixed(),
            this.k.z(5002),
            this.k.color(255, 255, 255),
            "cancelText"
        ]);
        
        // Reset button
        this.resetButton = this.k.add([
            this.k.rect(120, 40),
            this.k.pos(this.k.width() / 2 - 60, 100),
            this.k.fixed(),
            this.k.z(5001),
            this.k.color(100, 100, 200),
            this.k.area(),
            "resetCustomization"
        ]);
        
        this.resetText = this.k.add([
            this.k.text("Reset", { size: 20 }),
            this.k.pos(this.k.width() / 2, 120),
            this.k.anchor("center"),
            this.k.fixed(),
            this.k.z(5002),
            this.k.color(255, 255, 255),
            "resetText"
        ]);
        
        // Handle button clicks
        this.k.onTouchStart((pos) => {
            if (this.saveButton.hasPoint(pos)) {
                this.saveCustomization();
            } else if (this.cancelButton.hasPoint(pos)) {
                this.cancelCustomization();
            } else if (this.resetButton.hasPoint(pos)) {
                this.resetToDefault();
            }
        });
    }
    
    makeControlsDraggable() {
        // Visual indicators for draggable elements
        const controls = [
            { name: 'joystick', element: this.touchControls.joystickBase },
            { name: 'restart', element: this.k.get("restartBtn")[0] },
            { name: 'home', element: this.k.get("homeBtn")[0] },
            { name: 'music', element: this.k.get("djBtn")[0] }
        ];
        
        controls.forEach(control => {
            if (!control.element) return;
            
            // Add visual indicator
            const indicator = this.k.add([
                this.k.rect(control.element.width + 20, control.element.height + 20),
                this.k.pos(control.element.pos),
                this.k.anchor("center"),
                this.k.fixed(),
                this.k.z(control.element.z - 1),
                this.k.color(255, 255, 0),
                this.k.opacity(0.3),
                `${control.name}Indicator`
            ]);
            
            // Pulse animation
            indicator.onUpdate(() => {
                indicator.opacity = 0.3 + Math.sin(this.k.time() * 3) * 0.1;
            });
        });
        
        // Handle drag and drop
        let draggedControl = null;
        let dragOffset = { x: 0, y: 0 };
        
        this.k.onTouchStart((pos) => {
            controls.forEach(control => {
                if (control.element && control.element.hasPoint(pos)) {
                    draggedControl = control;
                    dragOffset = {
                        x: pos.x - control.element.pos.x,
                        y: pos.y - control.element.pos.y
                    };
                }
            });
        });
        
        this.k.onTouchMove((pos) => {
            if (draggedControl && draggedControl.element) {
                draggedControl.element.pos.x = pos.x - dragOffset.x;
                draggedControl.element.pos.y = pos.y - dragOffset.y;
                
                // Update indicator position
                const indicator = this.k.get(`${draggedControl.name}Indicator`)[0];
                if (indicator) {
                    indicator.pos = draggedControl.element.pos;
                }
                
                // Update joystick knob if moving joystick
                if (draggedControl.name === 'joystick') {
                    this.touchControls.joystickKnob.pos = draggedControl.element.pos;
                    this.touchControls.joystickCenter = {
                        x: draggedControl.element.pos.x,
                        y: draggedControl.element.pos.y
                    };
                }
            }
        });
        
        this.k.onTouchEnd(() => {
            draggedControl = null;
        });
    }
    
    saveCustomization() {
        // Save current positions as percentages
        this.customLayout = {
            joystick: {
                x: this.touchControls.joystickBase.pos.x / this.k.width(),
                y: this.touchControls.joystickBase.pos.y / this.k.height()
            },
            restart: this.getControlPosition("restartBtn"),
            home: this.getControlPosition("homeBtn"),
            music: this.getControlPosition("djBtn")
        };
        
        this.saveCustomLayout();
        this.endCustomization();
        
        // Show confirmation
        const confirmation = this.k.add([
            this.k.text("Layout saved!", { size: 32 }),
            this.k.pos(this.k.width() / 2, this.k.height() / 2),
            this.k.anchor("center"),
            this.k.fixed(),
            this.k.z(6000),
            this.k.color(0, 255, 0)
        ]);
        
        this.k.wait(2, () => this.k.destroy(confirmation));
    }
    
    getControlPosition(tag) {
        const element = this.k.get(tag)[0];
        if (!element) return null;
        
        return {
            x: element.pos.x / this.k.width(),
            y: element.pos.y / this.k.height()
        };
    }
    
    cancelCustomization() {
        // Restore original positions
        this.applyLayout(this.customLayout || this.defaultLayout);
        this.endCustomization();
    }
    
    resetToDefault() {
        this.applyLayout(this.defaultLayout);
    }
    
    applyLayout(layout) {
        // Apply joystick position
        if (layout.joystick && this.touchControls.joystickBase) {
            const joystickPos = {
                x: layout.joystick.x * this.k.width(),
                y: layout.joystick.y * this.k.height()
            };
            this.touchControls.joystickBase.pos = this.k.vec2(joystickPos.x, joystickPos.y);
            this.touchControls.joystickKnob.pos = this.k.vec2(joystickPos.x, joystickPos.y);
            this.touchControls.joystickCenter = joystickPos;
        }
        
        // Apply button positions
        const buttons = [
            { tag: "restartBtn", layout: layout.restart },
            { tag: "homeBtn", layout: layout.home },
            { tag: "djBtn", layout: layout.music }
        ];
        
        buttons.forEach(button => {
            const element = this.k.get(button.tag)[0];
            if (element && button.layout) {
                element.pos = this.k.vec2(
                    button.layout.x * this.k.width(),
                    button.layout.y * this.k.height()
                );
            }
        });
    }
    
    endCustomization() {
        this.isCustomizing = false;
        
        // Remove customization UI
        this.k.get("customizeOverlay").forEach(e => this.k.destroy(e));
        this.k.get("customizeInstructions").forEach(e => this.k.destroy(e));
        this.k.get("saveCustomization").forEach(e => this.k.destroy(e));
        this.k.get("saveText").forEach(e => this.k.destroy(e));
        this.k.get("cancelCustomization").forEach(e => this.k.destroy(e));
        this.k.get("cancelText").forEach(e => this.k.destroy(e));
        this.k.get("resetCustomization").forEach(e => this.k.destroy(e));
        this.k.get("resetText").forEach(e => this.k.destroy(e));
        
        // Remove indicators
        ["joystick", "restart", "home", "music"].forEach(name => {
            this.k.get(`${name}Indicator`).forEach(e => this.k.destroy(e));
        });
    }
    
    // Load and apply custom layout on initialization
    initializeLayout() {
        if (this.customLayout) {
            this.applyLayout(this.customLayout);
        }
    }
}

// Add customization button to settings or pause menu
export function addCustomizationButton(k, touchControls) {
    const customizer = new TouchControlCustomizer(k, touchControls);
    customizer.initializeLayout();
    
    // Add settings button (gear icon)
    const settingsButton = k.add([
        k.text("⚙", { size: 32 }),
        k.pos(k.width() - 40, 80),
        k.fixed(),
        k.area(),
        k.z(1000),
        k.opacity(0.5),
        "settingsBtn"
    ]);
    
    k.onTouchStart((pos) => {
        if (settingsButton.hasPoint(pos) && !customizer.isCustomizing) {
            customizer.startCustomization();
        }
    });
    
    return customizer;
}