"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Stage, Layer, Rect, Line, Circle, Text } from "react-konva"
import type { KonvaEventObject } from "konva/lib/Node"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import {
  Square,
  CircleIcon,
  MousePointer,
  Ruler,
  Type,
  Save,
  Download,
  Upload,
  Trash2,
  Move,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  PanelLeft,
  PanelRight,
  FileImage,
  List,
  FileText,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { takeoffService, type TakeoffData } from "@/lib/takeoff-service"

interface TakeoffEditorProps {
  projectId: string
  initialTakeoffId?: string
}

// Shape types
type ShapeType = "rect" | "circle" | "line" | "text" | "image"

// Material types with colors
const materialTypes = [
  { id: "drywall", name: "Drywall", color: "#E5E7EB", unit: "SQ FT", unitCost: 0.65 },
  { id: "flooring", name: "Flooring", color: "#D1D5DB", unit: "SQ FT", unitCost: 3.5 },
  { id: "paint", name: "Paint", color: "#F3F4F6", unit: "SQ FT", unitCost: 0.35 },
  { id: "trim", name: "Trim", color: "#9CA3AF", unit: "LF", unitCost: 2.25 },
  { id: "cabinets", name: "Cabinets", color: "#6B7280", unit: "LF", unitCost: 150.0 },
  { id: "countertop", name: "Countertop", color: "#4B5563", unit: "LF", unitCost: 75.0 },
  { id: "tile", name: "Tile", color: "#D97706", unit: "SQ FT", unitCost: 8.5 },
  { id: "carpet", name: "Carpet", color: "#78350F", unit: "SQ FT", unitCost: 4.25 },
  { id: "hardwood", name: "Hardwood", color: "#92400E", unit: "SQ FT", unitCost: 7.5 },
  { id: "vinyl", name: "Vinyl", color: "#A1A1AA", unit: "SQ FT", unitCost: 2.75 },
  { id: "concrete", name: "Concrete", color: "#71717A", unit: "SQ FT", unitCost: 6.0 },
  { id: "framing", name: "Framing", color: "#FBBF24", unit: "LF", unitCost: 3.5 },
  { id: "insulation", name: "Insulation", color: "#FBBF24", unit: "SQ FT", unitCost: 1.25 },
  { id: "roofing", name: "Roofing", color: "#44403C", unit: "SQ FT", unitCost: 4.5 },
  { id: "siding", name: "Siding", color: "#A8A29E", unit: "SQ FT", unitCost: 5.75 },
  { id: "plumbing", name: "Plumbing", color: "#0EA5E9", unit: "EA", unitCost: 250.0 },
  { id: "electrical", name: "Electrical", color: "#FACC15", unit: "EA", unitCost: 175.0 },
  { id: "hvac", name: "HVAC", color: "#84CC16", unit: "EA", unitCost: 350.0 },
]

// Room templates
const roomTemplates = [
  { id: "bathroom-small", name: "Small Bathroom", width: 5, height: 8, unit: "ft" },
  { id: "bathroom-large", name: "Large Bathroom", width: 8, height: 10, unit: "ft" },
  { id: "kitchen-small", name: "Small Kitchen", width: 10, height: 12, unit: "ft" },
  { id: "kitchen-large", name: "Large Kitchen", width: 12, height: 15, unit: "ft" },
  { id: "bedroom-small", name: "Small Bedroom", width: 10, height: 10, unit: "ft" },
  { id: "bedroom-large", name: "Large Bedroom", width: 12, height: 14, unit: "ft" },
  { id: "living-room", name: "Living Room", width: 15, height: 20, unit: "ft" },
  { id: "dining-room", name: "Dining Room", width: 12, height: 12, unit: "ft" },
  { id: "garage-1car", name: "1-Car Garage", width: 12, height: 20, unit: "ft" },
  { id: "garage-2car", name: "2-Car Garage", width: 20, height: 20, unit: "ft" },
]

interface Shape {
  id: string
  type: ShapeType
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  points?: number[]
  text?: string
  fontSize?: number
  fill: string
  stroke: string
  strokeWidth: number
  draggable: boolean
  materialType?: string
  materialName?: string
  materialUnit?: string
  materialUnitCost?: number
  quantity?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
}

export default function TakeoffEditor({ projectId, initialTakeoffId }: TakeoffEditorProps) {
  // Canvas state
  const [stageWidth, setStageWidth] = useState(1200)
  const [stageHeight, setStageHeight] = useState(800)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [history, setHistory] = useState<Shape[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [tool, setTool] = useState<"select" | "rect" | "circle" | "line" | "text" | "measure" | "move">("select")
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [selectedMaterial, setSelectedMaterial] = useState(materialTypes[0].id)
  const [showMaterialPanel, setShowMaterialPanel] = useState(true)
  const [measurements, setMeasurements] = useState<any[]>([])
  const [measurementInProgress, setMeasurementInProgress] = useState<any>(null)
  const [scale1To1, setScale1To1] = useState(1) // 1 pixel = 1 inch by default
  const [scaleUnit, setScaleUnit] = useState<"in" | "ft" | "m" | "cm">("in")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  // Takeoff metadata
  const [takeoffId, setTakeoffId] = useState<string | undefined>(initialTakeoffId)
  const [takeoffName, setTakeoffName] = useState("New Takeoff")
  const [takeoffDescription, setTakeoffDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(!!initialTakeoffId)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showEstimateDialog, setShowEstimateDialog] = useState(false)
  const [markupPercentage, setMarkupPercentage] = useState(20)
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)
  const [imageScale, setImageScale] = useState(1)
  const [showImageScaleDialog, setShowImageScaleDialog] = useState(false)
  const [knownMeasurement, setKnownMeasurement] = useState(0)
  const [knownMeasurementUnit, setKnownMeasurementUnit] = useState<"in" | "ft" | "m" | "cm">("in")

  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load takeoff data if initialTakeoffId is provided
  useEffect(() => {
    if (initialTakeoffId) {
      loadTakeoff(initialTakeoffId)
    }
  }, [initialTakeoffId])

  // Initialize stage size based on container
  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect()
      setStageWidth(width - 32) // Account for padding
    }

    // Add window resize handler
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        setStageWidth(width - 32)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Save to history when shapes change
  useEffect(() => {
    if (
      shapes.length > 0 &&
      (historyIndex === -1 || JSON.stringify(shapes) !== JSON.stringify(history[historyIndex]))
    ) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push([...shapes])
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [shapes])

  // Load takeoff data from the database
  const loadTakeoff = async (id: string) => {
    try {
      setIsLoading(true)
      const takeoff = await takeoffService.getTakeoffById(id)

      if (takeoff) {
        setTakeoffId(takeoff.id)
        setTakeoffName(takeoff.name)
        setTakeoffDescription(takeoff.description || "")

        if (takeoff.data) {
          setShapes(takeoff.data.shapes || [])
          setMeasurements(takeoff.data.measurements || [])
          setScale1To1(takeoff.data.scale1To1 || 1)
          setScaleUnit((takeoff.data.scaleUnit as any) || "in")
        }

        toast({
          title: "Takeoff loaded",
          description: `Successfully loaded takeoff: ${takeoff.name}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Takeoff not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading takeoff:", error)
      toast({
        title: "Error",
        description: "Failed to load takeoff",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save takeoff data to the database
  const saveTakeoff = async () => {
    try {
      setIsSaving(true)

      const takeoffData: TakeoffData = {
        shapes,
        measurements,
        scale1To1,
        scaleUnit,
      }

      if (takeoffId) {
        // Update existing takeoff
        await takeoffService.updateTakeoff(takeoffId, {
          name: takeoffName,
          description: takeoffDescription,
          data: takeoffData,
        })

        toast({
          title: "Takeoff updated",
          description: "Your takeoff has been updated successfully",
        })
      } else {
        // Create new takeoff
        const newTakeoff = await takeoffService.createTakeoff(projectId, takeoffName, takeoffDescription, takeoffData)

        setTakeoffId(newTakeoff.id)

        toast({
          title: "Takeoff saved",
          description: "Your takeoff has been saved successfully",
        })
      }

      setShowSaveDialog(false)
    } catch (error) {
      console.error("Error saving takeoff:", error)
      toast({
        title: "Error",
        description: "Failed to save takeoff",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Generate estimate from takeoff
  const generateEstimate = async () => {
    try {
      if (!takeoffId) {
        // Save takeoff first if it hasn't been saved
        toast({
          title: "Save required",
          description: "Please save your takeoff before generating an estimate",
        })
        setShowSaveDialog(true)
        return
      }

      const estimateId = await takeoffService.generateEstimateFromTakeoff(takeoffId, markupPercentage)

      toast({
        title: "Estimate created",
        description: "Your estimate has been created successfully",
      })

      // Redirect to the new estimate
      window.location.href = `/estimates/${estimateId}`

      setShowEstimateDialog(false)
    } catch (error) {
      console.error("Error generating estimate:", error)
      toast({
        title: "Error",
        description: "Failed to generate estimate",
        variant: "destructive",
      })
    }
  }

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setShapes([...history[historyIndex - 1]])
    }
  }

  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setShapes([...history[historyIndex + 1]])
    }
  }

  // Get material by ID
  const getMaterial = (id: string) => {
    return materialTypes.find((m) => m.id === id) || materialTypes[0]
  }

  // Handle tool selection
  const handleToolSelect = (newTool: typeof tool) => {
    setTool(newTool)
    setSelectedId(null)
  }

  // Handle stage mouse down
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (tool === "select" || tool === "move") {
      const clickedOnEmpty = e.target === e.target.getStage()
      if (clickedOnEmpty) {
        setSelectedId(null)
        return
      }
      return
    }

    setIsDrawing(true)
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return

    // Adjust for stage scale and position
    const x = (pos.x - position.x) / scale
    const y = (pos.y - position.y) / scale

    // Snap to grid if enabled
    const snappedX = snapToGrid ? Math.round(x / gridSize) * gridSize : x
    const snappedY = snapToGrid ? Math.round(y / gridSize) * gridSize : y

    setStartPoint({ x: snappedX, y: snappedY })

    if (tool === "measure") {
      setMeasurementInProgress({
        id: `measure-${Date.now()}`,
        points: [snappedX, snappedY, snappedX, snappedY],
        text: "0",
      })
      return
    }

    const material = getMaterial(selectedMaterial)

    if (tool === "rect") {
      const newShape: Shape = {
        id: `rect-${Date.now()}`,
        type: "rect",
        x: snappedX,
        y: snappedY,
        width: 0,
        height: 0,
        fill: material.color,
        stroke: "#000000",
        strokeWidth: 1,
        draggable: true,
        materialType: selectedMaterial,
        materialName: material.name,
        materialUnit: material.unit,
        materialUnitCost: material.unitCost,
      }
      setShapes([...shapes, newShape])
      setSelectedId(newShape.id)
    } else if (tool === "circle") {
      const newShape: Shape = {
        id: `circle-${Date.now()}`,
        type: "circle",
        x: snappedX,
        y: snappedY,
        radius: 0,
        fill: material.color,
        stroke: "#000000",
        strokeWidth: 1,
        draggable: true,
        materialType: selectedMaterial,
        materialName: material.name,
        materialUnit: material.unit,
        materialUnitCost: material.unitCost,
      }
      setShapes([...shapes, newShape])
      setSelectedId(newShape.id)
    } else if (tool === "line") {
      const newShape: Shape = {
        id: `line-${Date.now()}`,
        type: "line",
        x: 0,
        y: 0,
        points: [snappedX, snappedY, snappedX, snappedY],
        fill: "",
        stroke: "#000000",
        strokeWidth: 2,
        draggable: true,
        materialType: selectedMaterial,
        materialName: material.name,
        materialUnit: material.unit,
        materialUnitCost: material.unitCost,
      }
      setShapes([...shapes, newShape])
      setSelectedId(newShape.id)
    } else if (tool === "text") {
      const newText = prompt("Enter text:", "")
      if (newText) {
        const newShape: Shape = {
          id: `text-${Date.now()}`,
          type: "text",
          x: snappedX,
          y: snappedY,
          text: newText,
          fontSize: 16,
          fill: "#000000",
          stroke: "",
          strokeWidth: 0,
          draggable: true,
        }
        setShapes([...shapes, newShape])
        setSelectedId(newShape.id)
      }
    }
  }

  // Handle stage mouse move
  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return

    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return

    // Adjust for stage scale and position
    const x = (pos.x - position.x) / scale
    const y = (pos.y - position.y) / scale

    // Snap to grid if enabled
    const snappedX = snapToGrid ? Math.round(x / gridSize) * gridSize : x
    const snappedY = snapToGrid ? Math.round(y / gridSize) * gridSize : y

    if (tool === "measure" && measurementInProgress) {
      // Update measurement line
      const newMeasurement = { ...measurementInProgress }
      newMeasurement.points = [newMeasurement.points[0], newMeasurement.points[1], snappedX, snappedY]

      // Calculate distance
      const dx = newMeasurement.points[2] - newMeasurement.points[0]
      const dy = newMeasurement.points[3] - newMeasurement.points[1]
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Convert to selected unit
      let displayDistance: number
      let unit: string

      if (scaleUnit === "in") {
        displayDistance = distance / scale1To1
        unit = "in"
      } else if (scaleUnit === "ft") {
        displayDistance = distance / (scale1To1 * 12)
        unit = "ft"
      } else if (scaleUnit === "m") {
        displayDistance = distance / (scale1To1 * 39.37)
        unit = "m"
      } else {
        displayDistance = distance / (scale1To1 * 0.3937)
        unit = "cm"
      }

      newMeasurement.text = `${displayDistance.toFixed(2)} ${unit}`
      setMeasurementInProgress(newMeasurement)
      return
    }

    if (selectedId) {
      const newShapes = shapes.map((shape) => {
        if (shape.id !== selectedId) return shape

        if (shape.type === "rect") {
          // Calculate width and height
          const width = snappedX - startPoint.x
          const height = snappedY - startPoint.y

          // Calculate area for quantity
          const area = Math.abs(width * height)
          let quantity = 0

          if (shape.materialUnit === "SQ FT") {
            // Convert to square feet (assuming 1 unit = 1 inch)
            quantity = area / (scale1To1 * scale1To1 * 144) // 144 sq inches in a sq foot
          } else if (shape.materialUnit === "LF") {
            // Use perimeter for linear feet
            quantity = (2 * Math.abs(width) + 2 * Math.abs(height)) / (scale1To1 * 12) // 12 inches in a foot
          } else {
            quantity = 1 // Default for items counted as each
          }

          return {
            ...shape,
            width: Math.abs(width),
            height: Math.abs(height),
            x: width < 0 ? snappedX : startPoint.x,
            y: height < 0 ? snappedY : startPoint.y,
            quantity: quantity,
          }
        } else if (shape.type === "circle") {
          // Calculate radius
          const dx = snappedX - startPoint.x
          const dy = snappedY - startPoint.y
          const radius = Math.sqrt(dx * dx + dy * dy)

          // Calculate area for quantity
          const area = Math.PI * radius * radius
          let quantity = 0

          if (shape.materialUnit === "SQ FT") {
            // Convert to square feet (assuming 1 unit = 1 inch)
            quantity = area / (scale1To1 * scale1To1 * 144) // 144 sq inches in a sq foot
          } else if (shape.materialUnit === "LF") {
            // Use circumference for linear feet
            quantity = (2 * Math.PI * radius) / (scale1To1 * 12) // 12 inches in a foot
          } else {
            quantity = 1 // Default for items counted as each
          }

          return {
            ...shape,
            radius,
            quantity,
          }
        } else if (shape.type === "line") {
          // Calculate length for quantity
          const dx = snappedX - shape.points![0]
          const dy = snappedY - shape.points![1]
          const length = Math.sqrt(dx * dx + dy * dy)
          let quantity = 0

          if (shape.materialUnit === "LF") {
            quantity = length / (scale1To1 * 12) // 12 inches in a foot
          } else {
            quantity = 1
          }

          return {
            ...shape,
            points: [shape.points![0], shape.points![1], snappedX, snappedY],
            quantity,
          }
        }

        return shape
      })

      setShapes(newShapes)
    }
  }

  // Handle stage mouse up
  const handleMouseUp = () => {
    setIsDrawing(false)

    if (tool === "measure" && measurementInProgress) {
      setMeasurements([...measurements, measurementInProgress])
      setMeasurementInProgress(null)
      return
    }

    // Switch back to select tool after drawing
    if (tool !== "select" && tool !== "move") {
      setTool("select")
    }
  }

  // Handle shape selection
  const handleShapeSelect = (id: string) => {
    setSelectedId(id)
  }

  // Handle shape deletion
  const handleDelete = () => {
    if (selectedId) {
      setShapes(shapes.filter((shape) => shape.id !== selectedId))
      setSelectedId(null)
    }
  }

  // Handle zoom in
  const handleZoomIn = () => {
    setScale(scale * 1.2)
  }

  // Handle zoom out
  const handleZoomOut = () => {
    setScale(scale / 1.2)
  }

  // Handle zoom reset
  const handleZoomReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // Handle stage drag
  const handleStageDrag = (e: KonvaEventObject<DragEvent>) => {
    if (tool === "move") {
      setPosition({ x: e.target.x(), y: e.target.y() })
    }
  }

  // Handle shape drag
  const handleShapeDrag = (e: KonvaEventObject<DragEvent>, id: string) => {
    const shape = shapes.find((s) => s.id === id)
    if (!shape) return

    // Snap to grid if enabled
    if (snapToGrid) {
      const newX = Math.round(e.target.x() / gridSize) * gridSize
      const newY = Math.round(e.target.y() / gridSize) * gridSize
      e.target.position({ x: newX, y: newY })
    }
  }

  // Handle shape drag end
  const handleShapeDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
    const updatedShapes = shapes.map((shape) => {
      if (shape.id !== id) return shape

      // Get the new position
      const newX = e.target.x()
      const newY = e.target.y()

      return {
        ...shape,
        x: newX,
        y: newY,
      }
    })

    setShapes(updatedShapes)
  }

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)

    if (!templateId) return

    const template = roomTemplates.find((t) => t.id === templateId)
    if (!template) return

    // Convert template dimensions to pixels
    let width, height

    if (template.unit === "ft") {
      width = template.width * 12 * scale1To1 // Convert feet to inches, then to pixels
      height = template.height * 12 * scale1To1
    } else {
      width = template.width * scale1To1
      height = template.height * scale1To1
    }

    // Create a new rectangle with the template dimensions
    const material = getMaterial(selectedMaterial)
    const newShape: Shape = {
      id: `rect-${Date.now()}`,
      type: "rect",
      x: 100,
      y: 100,
      width,
      height,
      fill: material.color,
      stroke: "#000000",
      strokeWidth: 1,
      draggable: true,
      materialType: selectedMaterial,
      materialName: material.name,
      materialUnit: material.unit,
      materialUnitCost: material.unitCost,
      quantity: template.width * template.height, // Area in square feet
    }

    setShapes([...shapes, newShape])
    setSelectedId(newShape.id)
    setSelectedTemplate("")
  }

  // Calculate total materials and cost
  const calculateMaterials = () => {
    const materials: Record<string, { name: string; unit: string; unitCost: number; quantity: number; total: number }> =
      {}

    shapes.forEach((shape) => {
      if (!shape.materialType || !shape.quantity) return

      if (!materials[shape.materialType]) {
        materials[shape.materialType] = {
          name: shape.materialName || "",
          unit: shape.materialUnit || "",
          unitCost: shape.materialUnitCost || 0,
          quantity: 0,
          total: 0,
        }
      }

      materials[shape.materialType].quantity += shape.quantity
      materials[shape.materialType].total =
        materials[shape.materialType].quantity * materials[shape.materialType].unitCost
    })

    return Object.values(materials)
  }

  // Calculate total cost
  const calculateTotalCost = () => {
    const materials = calculateMaterials()
    return materials.reduce((total, material) => total + material.total, 0)
  }

  // Export takeoff as JSON
  const handleExport = () => {
    const takeoffData = {
      projectId,
      shapes,
      measurements,
      scale1To1,
      scaleUnit,
    }

    const dataStr = JSON.stringify(takeoffData)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `takeoff-${projectId}-${new Date().toISOString()}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Import takeoff from JSON
  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (data.shapes) setShapes(data.shapes)
          if (data.measurements) setMeasurements(data.measurements)
          if (data.scale1To1) setScale1To1(data.scale1To1)
          if (data.scaleUnit) setScaleUnit(data.scaleUnit)
        } catch (error) {
          console.error("Error parsing takeoff file:", error)
          alert("Invalid takeoff file format")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // Handle image upload
  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Process uploaded image
  const processImage = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setBackgroundImage(img)
        setShowImageScaleDialog(true)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Apply scale to image
  const applyImageScale = () => {
    if (!knownMeasurement || knownMeasurement <= 0) {
      toast({
        title: "Invalid measurement",
        description: "Please enter a valid measurement greater than zero",
        variant: "destructive",
      })
      return
    }

    // Calculate scale based on known measurement
    let pixelsPerUnit = 1

    if (knownMeasurementUnit === "in") {
      pixelsPerUnit = knownMeasurement
    } else if (knownMeasurementUnit === "ft") {
      pixelsPerUnit = knownMeasurement * 12
    } else if (knownMeasurementUnit === "m") {
      pixelsPerUnit = knownMeasurement * 39.37
    } else if (knownMeasurementUnit === "cm") {
      pixelsPerUnit = knownMeasurement * 0.3937
    }

    setScale1To1(pixelsPerUnit)
    setScaleUnit(knownMeasurementUnit)
    setShowImageScaleDialog(false)
  }

  // Render grid lines
  const renderGrid = () => {
    if (!showGrid) return null

    const gridLines = []
    const gridSpacing = gridSize * scale

    // Vertical lines
    for (let i = 0; i <= stageWidth / gridSpacing; i++) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSpacing, 0, i * gridSpacing, stageHeight]}
          stroke="#CCCCCC"
          strokeWidth={0.5}
        />,
      )
    }

    // Horizontal lines
    for (let i = 0; i <= stageHeight / gridSpacing; i++) {
      gridLines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSpacing, stageWidth, i * gridSpacing]}
          stroke="#CCCCCC"
          strokeWidth={0.5}
        />,
      )
    }

    return gridLines
  }

  // Calculate material totals
  const materialTotals = calculateMaterials()
  const totalCost = calculateTotalCost()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{takeoffName}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = `/projects/${projectId}/takeoff/list`)}
              >
                <List className="mr-2 h-4 w-4" />
                View All
              </Button>
              <Button variant="default" size="sm" onClick={() => setShowEstimateDialog(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Create Estimate
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={tool === "select" ? "default" : "outline"}
                size="sm"
                onClick={() => handleToolSelect("select")}
              >
                <MousePointer className="h-4 w-4 mr-1" />
                Select
              </Button>
              <Button
                variant={tool === "move" ? "default" : "outline"}
                size="sm"
                onClick={() => handleToolSelect("move")}
              >
                <Move className="h-4 w-4 mr-1" />
                Pan
              </Button>
              <Button
                variant={tool === "rect" ? "default" : "outline"}
                size="sm"
                onClick={() => handleToolSelect("rect")}
              >
                <Square className="h-4 w-4 mr-1" />
                Rectangle
              </Button>
              <Button
                variant={tool === "circle" ? "default" : "outline"}
                size="sm"
                onClick={() => handleToolSelect("circle")}
              >
                <CircleIcon className="h-4 w-4 mr-1" />
                Circle
              </Button>
              <Button
                variant={tool === "line" ? "default" : "outline"}
                size="sm"
                onClick={() => handleToolSelect("line")}
              >
                <Ruler className="h-4 w-4 mr-1" />
                Line
              </Button>
              <Button
                variant={tool === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => handleToolSelect("text")}
              >
                <Type className="h-4 w-4 mr-1" />
                Text
              </Button>
              <Button
                variant={tool === "measure" ? "default" : "outline"}
                size="sm"
                onClick={() => handleToolSelect("measure")}
              >
                <Ruler className="h-4 w-4 mr-1" />
                Measure
              </Button>

              <Separator orientation="vertical" className="h-8" />

              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomReset}>
                1:1
              </Button>

              <Separator orientation="vertical" className="h-8" />

              <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                <Redo2 className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-8" />

              <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
                <Grid3X3 className="h-4 w-4 mr-1" />
                {showGrid ? "Hide Grid" : "Show Grid"}
              </Button>

              <Button variant={snapToGrid ? "default" : "outline"} size="sm" onClick={() => setSnapToGrid(!snapToGrid)}>
                Snap to Grid
              </Button>

              <Separator orientation="vertical" className="h-8" />

              <Button variant="outline" size="sm" onClick={handleImageUpload}>
                <FileImage className="h-4 w-4 mr-1" />
                Import Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processImage(e.target.files[0])
                  }
                }}
              />

              <Separator orientation="vertical" className="h-8" />

              <Button variant="outline" size="sm" onClick={() => setShowMaterialPanel(!showMaterialPanel)}>
                {showMaterialPanel ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              </Button>

              <Separator orientation="vertical" className="h-8" />

              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Room Templates" />
                </SelectTrigger>
                <SelectContent>
                  {roomTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.width}x{template.height} {template.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedId && (
                <>
                  <Separator orientation="vertical" className="h-8" />
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>

            {/* Scale settings */}
            <div className="flex items-center gap-4 p-2 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
                <Label>Scale:</Label>
                <Input
                  type="number"
                  value={scale1To1}
                  onChange={(e) => setScale1To1(Number.parseFloat(e.target.value) || 1)}
                  className="w-20"
                />
                <span>pixels =</span>
                <Input type="number" value={1} readOnly className="w-16" />
                <Select value={scaleUnit} onValueChange={(value: any) => setScaleUnit(value)}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">inches</SelectItem>
                    <SelectItem value="ft">feet</SelectItem>
                    <SelectItem value="m">meters</SelectItem>
                    <SelectItem value="cm">cm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label>Grid Size:</Label>
                <Slider
                  value={[gridSize]}
                  min={5}
                  max={50}
                  step={5}
                  onValueChange={(value) => setGridSize(value[0])}
                  className="w-32"
                />
                <span>{gridSize}px</span>
              </div>
            </div>

            <div className="flex gap-4">
              {/* Canvas */}
              <div
                ref={containerRef}
                className="border border-gray-300 rounded-md overflow-hidden flex-grow"
                style={{ height: "600px" }}
              >
                <Stage
                  ref={stageRef}
                  width={stageWidth}
                  height={stageHeight}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  draggable={tool === "move"}
                  onDragEnd={handleStageDrag}
                  scale={{ x: scale, y: scale }}
                  position={position}
                >
                  <Layer>
                    {/* Background Image */}
                    {backgroundImage && (
                      <React.Fragment>
                        <Rect
                          x={0}
                          y={0}
                          width={backgroundImage.width}
                          height={backgroundImage.height}
                          fillPatternImage={backgroundImage}
                          opacity={0.5}
                        />
                      </React.Fragment>
                    )}

                    {/* Grid */}
                    {renderGrid()}

                    {/* Shapes */}
                    {shapes.map((shape) => {
                      if (shape.type === "rect") {
                        return (
                          <Rect
                            key={shape.id}
                            id={shape.id}
                            x={shape.x}
                            y={shape.y}
                            width={shape.width || 0}
                            height={shape.height || 0}
                            fill={shape.fill}
                            stroke={shape.id === selectedId ? "#0ea5e9" : shape.stroke}
                            strokeWidth={shape.id === selectedId ? 2 : shape.strokeWidth}
                            draggable={shape.draggable}
                            onClick={() => handleShapeSelect(shape.id)}
                            onTap={() => handleShapeSelect(shape.id)}
                            onDragMove={(e) => handleShapeDrag(e, shape.id)}
                            onDragEnd={(e) => handleShapeDragEnd(e, shape.id)}
                          />
                        )
                      } else if (shape.type === "circle") {
                        return (
                          <Circle
                            key={shape.id}
                            id={shape.id}
                            x={shape.x}
                            y={shape.y}
                            radius={shape.radius || 0}
                            fill={shape.fill}
                            stroke={shape.id === selectedId ? "#0ea5e9" : shape.stroke}
                            strokeWidth={shape.id === selectedId ? 2 : shape.strokeWidth}
                            draggable={shape.draggable}
                            onClick={() => handleShapeSelect(shape.id)}
                            onTap={() => handleShapeSelect(shape.id)}
                            onDragMove={(e) => handleShapeDrag(e, shape.id)}
                            onDragEnd={(e) => handleShapeDragEnd(e, shape.id)}
                          />
                        )
                      } else if (shape.type === "line") {
                        return (
                          <Line
                            key={shape.id}
                            id={shape.id}
                            points={shape.points || []}
                            stroke={shape.id === selectedId ? "#0ea5e9" : shape.stroke}
                            strokeWidth={shape.id === selectedId ? 2 : shape.strokeWidth}
                            draggable={shape.draggable}
                            onClick={() => handleShapeSelect(shape.id)}
                            onTap={() => handleShapeSelect(shape.id)}
                            onDragMove={(e) => handleShapeDrag(e, shape.id)}
                            onDragEnd={(e) => handleShapeDragEnd(e, shape.id)}
                          />
                        )
                      } else if (shape.type === "text") {
                        return (
                          <Text
                            key={shape.id}
                            id={shape.id}
                            x={shape.x}
                            y={shape.y}
                            text={shape.text || ""}
                            fontSize={shape.fontSize || 16}
                            fill={shape.fill}
                            draggable={shape.draggable}
                            onClick={() => handleShapeSelect(shape.id)}
                            onTap={() => handleShapeSelect(shape.id)}
                            onDragMove={(e) => handleShapeDrag(e, shape.id)}
                            onDragEnd={(e) => handleShapeDragEnd(e, shape.id)}
                          />
                        )
                      }
                      return null
                    })}

                    {/* Measurements */}
                    {measurements.map((measurement) => (
                      <React.Fragment key={measurement.id}>
                        <Line points={measurement.points} stroke="#0ea5e9" strokeWidth={1} dash={[5, 5]} />
                        <Text
                          x={(measurement.points[0] + measurement.points[2]) / 2}
                          y={(measurement.points[1] + measurement.points[3]) / 2 - 10}
                          text={measurement.text}
                          fontSize={12}
                          fill="#0ea5e9"
                          align="center"
                        />
                      </React.Fragment>
                    ))}

                    {/* Measurement in progress */}
                    {measurementInProgress && (
                      <React.Fragment>
                        <Line points={measurementInProgress.points} stroke="#0ea5e9" strokeWidth={1} dash={[5, 5]} />
                        <Text
                          x={(measurementInProgress.points[0] + measurementInProgress.points[2]) / 2}
                          y={(measurementInProgress.points[1] + measurementInProgress.points[3]) / 2 - 10}
                          text={measurementInProgress.text}
                          fontSize={12}
                          fill="#0ea5e9"
                          align="center"
                        />
                      </React.Fragment>
                    )}
                  </Layer>
                </Stage>
              </div>

              {/* Material Panel */}
              {showMaterialPanel && (
                <div className="w-64 border border-gray-300 rounded-md overflow-hidden">
                  <Tabs defaultValue="materials">
                    <TabsList className="w-full">
                      <TabsTrigger value="materials" className="flex-1">
                        Materials
                      </TabsTrigger>
                      <TabsTrigger value="summary" className="flex-1">
                        Summary
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="materials" className="p-2 space-y-2 h-[550px] overflow-y-auto">
                      <h3 className="font-medium">Select Material</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {materialTypes.map((material) => (
                          <div
                            key={material.id}
                            className={`p-2 border rounded-md cursor-pointer ${
                              selectedMaterial === material.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                            }`}
                            onClick={() => setSelectedMaterial(material.id)}
                          >
                            <div className="w-full h-4 mb-1 rounded-sm" style={{ backgroundColor: material.color }} />
                            <div className="text-xs font-medium truncate">{material.name}</div>
                            <div className="text-xs text-gray-500">
                              {material.unit} - ${material.unitCost.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="summary" className="p-2 h-[550px] overflow-y-auto">
                      <h3 className="font-medium mb-2">Material Summary</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {materialTotals.map((material, index) => (
                            <TableRow key={index}>
                              <TableCell>{material.name}</TableCell>
                              <TableCell>
                                {material.quantity.toFixed(2)} {material.unit}
                              </TableCell>
                              <TableCell>{formatCurrency(material.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="mt-4 p-2 bg-gray-50 rounded-md">
                        <div className="flex justify-between font-medium">
                          <span>Total Cost:</span>
                          <span>{formatCurrency(totalCost)}</span>
                        </div>
                      </div>

                      <Button className="w-full mt-4" onClick={() => setShowEstimateDialog(true)}>
                        Create Estimate from Takeoff
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Takeoff</DialogTitle>
            <DialogDescription>Enter a name and description for your takeoff.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="takeoff-name">Name</Label>
              <Input
                id="takeoff-name"
                value={takeoffName}
                onChange={(e) => setTakeoffName(e.target.value)}
                placeholder="Enter takeoff name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="takeoff-description">Description (optional)</Label>
              <Textarea
                id="takeoff-description"
                value={takeoffDescription}
                onChange={(e) => setTakeoffDescription(e.target.value)}
                placeholder="Enter takeoff description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveTakeoff} disabled={isSaving || !takeoffName.trim()}>
              {isSaving ? "Saving..." : "Save Takeoff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Estimate Dialog */}
      <Dialog open={showEstimateDialog} onOpenChange={setShowEstimateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Estimate from Takeoff</DialogTitle>
            <DialogDescription>Generate an estimate based on the materials in your takeoff.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="markup-percentage">Markup Percentage</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="markup-percentage"
                  value={[markupPercentage]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => setMarkupPercentage(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-right">{markupPercentage}%</span>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <div className="flex justify-between font-medium">
                <span>Materials Cost:</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between font-medium mt-2">
                <span>Markup Amount:</span>
                <span>{formatCurrency(totalCost * (markupPercentage / 100))}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Estimate:</span>
                <span>{formatCurrency(totalCost * (1 + markupPercentage / 100))}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEstimateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={generateEstimate}>Create Estimate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Scale Dialog */}
      <Dialog open={showImageScaleDialog} onOpenChange={setShowImageScaleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Image Scale</DialogTitle>
            <DialogDescription>Enter a known measurement from the image to set the scale correctly.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="known-measurement">Known Measurement</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="known-measurement"
                  type="number"
                  value={knownMeasurement}
                  onChange={(e) => setKnownMeasurement(Number(e.target.value))}
                  placeholder="Enter measurement"
                  className="flex-1"
                />
                <Select value={knownMeasurementUnit} onValueChange={(value: any) => setKnownMeasurementUnit(value)}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">inches</SelectItem>
                    <SelectItem value="ft">feet</SelectItem>
                    <SelectItem value="m">meters</SelectItem>
                    <SelectItem value="cm">cm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                After setting the scale, use the measure tool to verify measurements.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageScaleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={applyImageScale}>Apply Scale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
