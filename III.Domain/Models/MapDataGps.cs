using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("MAP_DATA_GPS")]
    public class MapDataGps
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string MapCode { get; set; }

        [StringLength(255)]
        public string MakerGPS { get; set; }

        public string PolygonGPS { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(255)]
        public string Icon { get; set; }

        [StringLength(255)]
        public string ObjType { get; set; }


        [StringLength(255)]
        public string ObjCode { get; set; }

        [StringLength(500)]
        public string Address { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
        public string Image { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public string GisData { get; set; }
    }
}
