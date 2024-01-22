using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using III.Domain.Common;

namespace ESEIM.Models
{
    [Table("lms_course")]
    public class LmsCourse : IPurchasableObject, StringExtensions.IEntity<int>
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string CourseCode { get; set; }

        [StringLength(255)]
        public string CourseName { get; set; }

        [StringLength(255)]
        public string CourseNote { get; set; }

        [StringLength(255)]
        public string ImgCover { get; set; }
        public int? Duration { get; set; }
        public string Unit { get; set; }
        public string Status { get; set; }
        public int? Flag { get; set; }
        public string VideoPresent { get; set; }
        public string FileBase { get; set; }
        public string ListSubject { get; set; }
        public int? Rating { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public bool? IsDeleted { get; set; }
        public string DeletedBy { get; set; }
        public bool? TopSearch { get; set; }
        public decimal? Price { get; set; }
        [NotMapped]
        public bool? IsPurchased { get; set; }
    }

    public interface IPurchasableObject
    {
        decimal? Price { get; set; }
        [NotMapped]
        bool? IsPurchased { get; set; }
    }
}
