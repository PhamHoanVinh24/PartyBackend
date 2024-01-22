using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_JNANA_FILE")]
    public class RmJnanaFile
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [StringLength(maximumLength: 255)]
        public string FileCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string FileName { get; set; }

        [StringLength(maximumLength: 255)]
        public string FileTitle { get; set; }
        [StringLength(maximumLength: 255)]
        public string FileNote { get; set; }

        public float? FileSize { get; set; }

        [StringLength(maximumLength: 10)]
        public string FileExt { get; set; }

        public int? CreatedBy { get; set; }
       
        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public int FileStatus { get; set; }

        [StringLength(maximumLength: 250)]
        public string FileCatCode { get; set; }

        [StringLength(maximumLength: 250)]
        public string FilePath { get; set; }
    }
}
