using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_ROMOOC_REMOOC")]
    public class RmRemoocRemooc
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string CompanyCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string BarCode { get; set; }
        [StringLength(maximumLength: 255)]
        public string Code { get; set; }
        [StringLength(maximumLength: 255)]
        public string Generic { get; set; }
        [StringLength(maximumLength: 255)]
        public string Title { get; set; }
        [StringLength(maximumLength: 255)]
        public string Origin { get; set; }

        [StringLength(maximumLength: 255)]
        public string Image { get; set; }
        public DateTime? DateOfEntry { get; set; }

        public DateTime? DateOfUse { get; set; }

        public DateTime? CreateDate { get; set; }
        public int? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? UpdateBy { get; set; }
        public int? Extrafield { get; set; }
        public int? FlagDelete { get; set; }
        [StringLength(maximumLength: 255)]
        public string Container { get; set; }

        [StringLength(maximumLength: 255)]
        public string Type { get; set; }
        [StringLength(maximumLength: 255)]
        public string LisencePlate { get; set; }
        [StringLength(maximumLength: 255)]
        public string OwerCode { get; set; }
        [StringLength(maximumLength: 255)]
        public string Brand { get; set; }
        [StringLength(maximumLength: 255)]
        public string SelfWeight { get; set; }
        [StringLength(maximumLength: 255)]
        public string DesignWeight { get; set; }
        [StringLength(maximumLength: 255)]
        public string TotalWeight { get; set; }
        [StringLength(maximumLength: 255)]
        public string Number { get; set; }
        [StringLength(maximumLength: 255)]
        public string Size { get; set; }
        [StringLength(maximumLength: 255)]
        public string CurentSize { get; set; }
        [StringLength(maximumLength: 255)]
        public string InternalCode { get; set; }
        [StringLength(maximumLength: 500)]
        public string Description { get; set; }

        public int? NumberTruck { get; set; }
        public DateTime? DayRegistry { get; set; }
        [StringLength(maximumLength: 1000)]
        public string PositionGPS { get; set; }
        [StringLength(maximumLength: 500)]
        public string PositionText { get; set; }
        public int SumDistance { get; set; }
        [StringLength(maximumLength: 255)]
        public string Group { get; set; }
        [StringLength(maximumLength: 1000)]
        public string Note { get; set; }

    }
}