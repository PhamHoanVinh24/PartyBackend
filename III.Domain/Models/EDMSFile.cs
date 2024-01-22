using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using III.Domain.Common;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("EDMS_FILES")]
    public class EDMSFile : IPurchasableObject, StringExtensions.IEntity<int>
    {
        [NotMapped]
        public int Id {
            get => FileID;
            set => FileID = value;
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FileID { get; set; }

        [StringLength(100)]
        public string FileCode { get; set; }

        [StringLength(255)]
        public string FileName { get; set; }

        [StringLength(255)]
        public decimal? FileSize { get; set; }

        [StringLength(255)]
        public string FileTypePhysic { get; set; }

        [StringLength(255)]
        public string FileTypeWork { get; set; }

        public string Desc { get; set; }

        public string Tags { get; set; }

        [StringLength(255)]
        public string Url { get; set; }

        [StringLength(100)]
        public string ReposCode { get; set; }

        [StringLength(50)]
        public string NumberDocument { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(255)]
        public string MimeType { get; set; }

        [StringLength(100)]
        public string CloudFileId { get; set; }

        public bool? IsEdit { get; set; }

        public bool? IsFileMaster { get; set; }

        public bool? IsFileOrigin { get; set; }

        public int? FileParentId { get; set; }
        [StringLength(50)]
        public string EditedFileBy { get; set; }

        public DateTime? EditedFileTime { get; set; }

        public string ListUserView { get; set; }

        public bool? IsScan { get; set; }

        public string MetaDataExt { get; set; }

        public bool? IsSearchIndex { get; set; }

        public string AudioBook { get; set; }
        //{
        //    get => JsonConvert.SerializeObject(ListAudioBooks);
        //    set =>
        //        ListAudioBooks = string.IsNullOrEmpty(value)
        //            ? new List<AudioBookItem>()
        //            : JsonConvert.DeserializeObject<List<AudioBookItem>>(value);
        //}

        //[NotMapped]
        //public List<AudioBookItem> ListAudioBooks { get; set; }
        public decimal? Price { get; set; }
        [NotMapped]
        public bool? IsPurchased { get; set; }
    }

    public class AudioBookItem
    {
        public int Index { get; set; }
        public string AudioPath { get; set; }
    }
}