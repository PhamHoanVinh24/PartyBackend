using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("WHS_ZONE_STRUCT")]
    public class ZoneStruct
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string ZoneCode { get; set; }

        public string ZoneName { get; set; }

        public string ZoneLabel { get; set; }

        public int? ZoneLevel { get; set; }

        public string ZoneParent { get; set; }

        public string ZoneHierachy { get; set; }

        public string ZoneType { get; set; }

        public string ZoneGroup { get; set; }

        [NotMapped]
        public int? ZoneQuantity { get; set; }

        public string SvgIconData { get; set; }

        public string ShapeData { get; set; }

        public string Image { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }

    public class ZoneStructModel
    {
        public int Id { get; set; }

        public string ZoneCode { get; set; }

        public string ZoneName { get; set; }

        public string ZoneLabel { get; set; }

        public int? ZoneLevel { get; set; }

        public string ZoneParent { get; set; }

        public int? ZoneParentId { get; set; }

        public string ZoneHierachy { get; set; }

        public string ZoneType { get; set; }

        public string ZoneGroup { get; set; }

        public string Quantity { get; set; }

        public string Status { get; set; }

        public string SvgIconData { get; set; }

        public string Image { get; set; }
    }
}
