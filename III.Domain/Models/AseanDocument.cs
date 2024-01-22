using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("ASEAN_DOCUMENT")]
    public class AseanDocument
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(maximumLength: 100)]
        public string File_Code { get; set; }

        [StringLength(maximumLength: 255)]
        public string Title { get; set; }

        [StringLength(maximumLength: 255)]
        public string Subdesc { get; set; }

        [StringLength(maximumLength: 255)]
        public string File_Type { get; set; }

        public int Version { get; set; }

        [StringLength(maximumLength: 255)]
        public string File_Name { get; set; }

        [StringLength(maximumLength: 255)]
        public string File_Site { get; set; }

        [StringLength(maximumLength: 255)]
        public string File_Path { get; set; }

        [StringLength(maximumLength: 255)]
        public string Description { get; set; }

        public int Parent_Id { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(255)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }
        public bool IsEdited { get; set; }
        [StringLength(255)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        [StringLength(100)]
        public string CateCode { get; set; }

        [StringLength(500)]
        public string FullPathView { get; set; }

        [StringLength(maximumLength: 255)]
        public string ViewPath { get; set; }

        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sCreatedTime { get; set; }

        [NotMapped]
        public bool? IsEdit { get; set; }

        [NotMapped]
        public bool? IsFileMaster { get; set; }

        [NotMapped]
        public int? FileParentId { get; set; }

        [NotMapped]
        public string EditedFileBy { get; set; }

        [NotMapped]
        public DateTime? EditedFileTime { get; set; }
        [NotMapped]
        public int? Mode { get; set; }

        [NotMapped]
        public string FirstPage { get; set; }

        [NotMapped]
        public bool IsSign { get; set; }

        [NotMapped]
        public string ObjCode { get; set; }

        [NotMapped]
        public string ObjType { get; set; }

        [NotMapped]
        public string WfInstCode { get; set; }
    }
}