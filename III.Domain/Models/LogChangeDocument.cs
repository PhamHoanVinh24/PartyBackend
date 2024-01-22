using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("LOG_CHANGE_DOCUMENT")]
    public class LogChangeDocument
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string UserID { get; set; }
        public string LogContent{ get; set; }
        public string LogText { get; set; }
        public DateTime? TimeEdit { get; set; }
        public DateTime? TimeFinish { get; set; }
        [StringLength(maximumLength: 255)]
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsEdited { get; set; }
        public DateTime? DeletedTime { get; set; }
        [StringLength(maximumLength: 50)]
        public string DeletedBy { get; set; }
        [StringLength(maximumLength: 255)]
        public string FileName { get; set; }
        [StringLength(maximumLength: 100)]
        public string FileCode { get; set; }
        [StringLength(maximumLength: 100)]
        public string FileType { get; set; }
        public string ObjCode { get; set; }
        public string ObjType { get; set; }
    }
}
