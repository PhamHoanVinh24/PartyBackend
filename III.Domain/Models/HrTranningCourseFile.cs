using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("HR_TRANNING_COURSE_FILE")]
    public class HrTranningCourseFile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string FileCode { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public int IdTranningCourse { get; set; }
    }
}
