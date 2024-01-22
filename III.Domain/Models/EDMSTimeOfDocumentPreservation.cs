using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("EDMS_TIME_OF_DOCUMENT_PRESERVATION")]
    public class EDMSTimeOfDocumentPreservation
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string Code { get; set; }

        [StringLength(500)]
        public string Title { get; set; }
        
        public int StorageTimeLimit { get; set; }

        [StringLength(500)]
        public string TypeLevel1 { get; set; }

        [StringLength(255)]
        public string TypeLevel2 { get; set; }

        [StringLength(255)]
        public string GroupLevel1 { get; set; }

        [StringLength(255)]
        public string GroupLevel2 { get; set; }

        [StringLength(255)]
        public string GroupLevel3 { get; set; }

        [StringLength(1500)]
        public string TitleFull { get; set; }
        public bool IsDeleted { get; set; }

        [StringLength(100)]
        public string CodeTableCommon { get; set; }
    }
}