using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_JNANA_NEWS_ARTICLE")]
    public class RmJnanaNewsArticle
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 250)]
        public string ArticleCode { get; set; }


        [StringLength(maximumLength: 1000)]
        public string ArticleTitle { get; set; }

        public int? ArtileOrder { get; set; }

        public int? CreatedBy { get; set; }
        public int? UpdateBy { get; set; }

        [StringLength(maximumLength: 1000)]
        public string ArticleContent { get; set; }

        [StringLength(maximumLength: 1000)]
        public string ArticleAvarta { get; set; }

      
        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdateTime { get; set; }
        public int ArticleStatus { get; set; }

        [StringLength(maximumLength: 250)]
        public string CatCode { get; set; }

    }
    public class SeachNewsModel
    {
        public string CatCode { get; set; }
        public string Title { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public int Page { get; set; }
        public int Length { get; set; }
    }
}
