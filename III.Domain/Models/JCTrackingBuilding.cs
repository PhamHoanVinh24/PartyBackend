using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("JC_TRACKING_BUILDING")]
    public class JCTrackingBuilding
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Key, StringLength(100)]
        public string JctCode { get; set; }

        [StringLength(100)]
        public string JobCardCode { get; set; }

        [StringLength(255)]
        public string Progress { get; set; }

        public string Note { get; set; }

        [StringLength(255)]
        public string LocationText { get; set; }

        [StringLength(255)]
        public string LocationGps { get; set; }

        [StringLength(100)]
        public string TeamCode { get; set; }

        [JsonIgnore]
        public Team Team { get; set; }

        [StringLength(255)]
        public string Device { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }

        [NotMapped]
        public string ListCode { get; set; }

        [NotMapped]
        public string TeamName { get; set; }
    }
    public class JCTrackingBuildModel
    {
        public JCTrackingBuilding TrkBuilding { get; set; }
        public List<JCTrackingMedia> ListTrackingImage { get; set; }
        public List<int> ListTrackingImageDelete { get; set; }
        public List<JCKMaterialsComsume> ListMaterialsBuilding { get; set; }
    }
}