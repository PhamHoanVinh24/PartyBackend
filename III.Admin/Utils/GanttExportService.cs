using System;
using System.Collections;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Syncfusion.XlsIO;
//using Syncfusion.EJ.Export;
//using Syncfusion.JavaScript.Models;
using Syncfusion.Pdf;

namespace ESEIM.Utils
{

    public interface IGanttExportService
    {
        IActionResult ExportExcelGantt(object dataSource);
        IActionResult ExportPdfGantt(object dataSource);
    }
    public class GanttExportService : IGanttExportService
    {
        //private GanttProperties ganttModel;
        public IActionResult ExportExcelGantt(object dataSource)
        {
            //ExcelExport exp = new ExcelExport();
            //GanttExportSettings settings = new GanttExportSettings();
            //settings.Theme = ExportTheme.FlatLime;
            //var ganttExport = new GanttExcelExport();
            //ganttExport.ExportSettings = settings;
            //ganttExport.ExcelVersion = ExcelVersion.Excel2010;
            //ganttExport.FileName = "Export.xlsx";
            //return ganttExport.Export(ganttModel, (IEnumerable)dataSource, false);
            return null;
        }

        public IActionResult ExportPdfGantt(object dataSource)
        {
            //PdfExport exp = new PdfExport();
            //GanttPdfExportSettings settings = new GanttPdfExportSettings();
            //settings.EnableFooter = true;
            //settings.ProjectName = "Project Tracker";
            ////settings.Locale = e.Arguments["locale"].ToString();
            //settings.Theme = GanttExportTheme.FlatLime;
            //var ganttExport = new GanttPdfExport();
            //ganttExport.ExportSettings = settings;
            //return exp.Export(ganttModel, (IEnumerable)dataSource, ganttExport);
            return null;
        }
    }
    public class GanttData
    {

        public int TaskId { get; set; }

        public string TaskName { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public DateTime? BaselineStartDate { get; set; }

        public DateTime? BaselineEndDate { get; set; }

        public int? Duration { get; set; }

        public List<GanttData> SubTasks { get; set; }

        public string Progress { get; set; }

        public List<int> ResourceId { get; set; }

        public string Predecessor { get; set; }

    }
}