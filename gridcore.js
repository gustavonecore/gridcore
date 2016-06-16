/*
	Example os usage

	grid = new GridCore({
		columns:[
			{name:'code', title:'OT'},
			{name:'description', title:'Detalle'},
			{name:'customer_name', title:'Cliente'},
			{name:'price', title:'Precio'},
			{name:'start_dt', title:'F. Compromiso'},
			{
				actionColumn: true,
				title:'Actions',
				renderer: function(item)
				{
					return '<div class="col-lg-8">' +
								'<div class="col-lg-3">' +
									'<a title="Imprimir" data-id="' + item.id + '" href="javascript:void(0)" class="btn btn-xs btn-default ot-print"><span class="glyphicon glyphicon-print" aria-hidden="true"></span></a>' +
								'</div>' +
								'<div class="col-lg-3">' +
									'<a title="Editar" data-id="' + item.id + '" href="javascript:void(0)" class="btn btn-xs btn-default ot-edit"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></a>' +
								'</div>' +
								'<div class="col-lg-3">' +
									'<a title="Editar" data-code="' + item.code + '" data-id="' + item.id + '" href="javascript:void(0)" class="btn btn-xs btn-danger ot-delete"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a>' +
								'</div>' +
							'</div>';
				}
			}
		],
		dataUrl: BASE_URL + 'order',
		height: 450,
		selector: 'oss-ot-grid',
		onRowClick: function(item, grid)
		{
			$.restCore('GET', BASE_URL + 'order/' + item.id, null, function(error, response)
			{
				// do something
			});
		},
		onRowDoubleClick: function(item, grid)
		{
			location.href = BASE_URL + 'order/edit/' + item.id;
		},
		bindActionColumn: function()
		{
			// Print ot
			$('.ot-print').off('click');
			$('.ot-print').on('click', function()
			{
				// print action
			});

			// Edit ot
			$('.ot-edit').off('click');
			$('.ot-edit').on('click', function()
			{
				// edit action
			});

			// Delete ot
			$('.ot-delete').off('click');
			$('.ot-delete').on('click', function()
			{
				// delete action
			});
		}
	});
*/

function GridCore(options)
{
	this._extend(options);

	this._buildComponent();

	this._init();
}

GridCore.consts = {
	PAGINATOR_RP: 10,
	PAGINATOR_PAGE_START: 0,
	PAGINATOR_RP_OPTIONS: [10, 50, 100, 200],
	HEIGHT: 400
}

GridCore.prototype = {
	tbody:null,
	dataUrl:null,
	autoLoad: true,

	items:{},
	headers:{},
	columns:[],
	selected:null,
	height: null,
	// The id of the div tag
	selector: null,

	// The jquery DOM instance of the given selector
	_container: null,
	// The jquery id string of the container
	_containerId: null,

	_tableId: null,
	_theadId: null,
	_tbodyId: null,
	_paginatorContainerId: null,

	bindings:{
		paginator: false
	},

	pagination:{
		rp: GridCore.consts.PAGINATOR_RP,
		page: GridCore.consts.PAGINATOR_PAGE_START,
		rp_options: GridCore.consts.PAGINATOR_RP_OPTIONS
	},

	order:{
		field: null,
		direction: null
	},

	sortByHeader: true,

	showPaginator: true,

	_init: function()
	{
		if (this.autoLoad)
		{
			this._fillHeaders();

			this.load({}, this.dataUrl);
		}
	},

	_extend: function(options)
	{
		for (var option in options)
		{
			this[option] = options[option];
		}
	},

	_validateDomSelector: function()
	{
		var self = this;
		var id = '#' + self.selector;

		if (!self.selector)
		{
			throw 'You must define the selector property with the id of the related container';
		}

		if (!$(id)[0])
		{
			throw 'The DOM object related to the selector is invalid or is not rendered yet';
		}

		self._container = $(id);
		self._containerId = id;
	},

	_getTableContainerHtml: function()
	{
		var self = this;
		var height = self.height ? self.height : GridCore.consts.HEIGHT;
		var style = ['overflow-y:scroll', 'height:' + height + 'px'];

		var ct = '<div id="' + self._containerId + '" class="table-responsive table-bordered gc-table-container" style="'+ style.join(';') +'">';

		ct += self._getTableHtml();
		ct += '</div>';

		return ct;
	},

	_getPaginatorContainerHtml: function()
	{
		var self = this;
		self._paginatorContainerId = uuid();

		var style = '';

		if (!self.showPaginator)
		{
			style = 'display:none;';
		}

		var ct = '<div id="' + self._paginatorContainerId + '" class="col-lg-12 gc-paginator" style="' + style + '">';
		ct += self._getPaginatorHtml();
		ct += '</div>';

		self._paginatorContainerId = '#' + self._paginatorContainerId;

		return ct;
	},

	_getTableHtml: function()
	{
		var self = this;

		self._tableId = uuid();
		self._theadId = uuid();
		self._tbodyId = uuid();

		var table = '<table id="' + self._tableId + '" class="table table-striped table-hover gc-table" >';
		table += '<thead id="' + self._theadId + '"></thead>';
		table += '<tbody id="' + self._tbodyId + '"></tbody>';
		table += '</table>';

		self._tableId = '#' + self._tableId;
		self._theadId = '#' + self._theadId;
		self._tbodyId = '#' + self._tbodyId;

		return table;
	},

	_getPaginatorHtml: function()
	{
		var self = this;

		var html = '';
		html += '<div class="col-lg-1">Page: </div>';
		html += '<div class="col-lg-3">';
			html += '<button class="btn btn-default btn-xs gc-page-start"><span class="glyphicon glyphicon-fast-backward" aria-hidden="true"></span></button>';
			html += '<button class="btn btn-default btn-xs gc-page-prev"><span class="glyphicon glyphicon-step-backward" aria-hidden="true"></span></button>';
			html += '<input class="gc-page-value" style="width:30px;height:21px;" value="' + parseInt(GridCore.consts.PAGINATOR_PAGE_START+1) + '"/>';
			html += '<button class="btn btn-default btn-xs gc-page-next"><span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span></button>';
			html += '<button class="btn btn-default btn-xs gc-page-last"><span class="glyphicon glyphicon-fast-forward" aria-hidden="true"></span></button>';
		html += '</div>';
		html += '<div class="col-lg-5">';
			html += self._getRpSelectHtml();
		html += '</div>';

		return html;
	},

	_getRpSelectHtml: function()
	{
		var self = this;

		var firstRp = self.pagination.rp_options ? self.pagination.rp_options[0] : GridCore.consts.PAGINATOR_RP_OPTIONS[0];

		var html = '';

		html += '<div class="btn-group gc-select">';
			html += '<button type="button" data-value="' + firstRp + '" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + firstRp + ' <span class="caret"></span></button>';
			html += '<ul class="dropdown-menu">';

			for (var i in self.pagination.rp_options)
			{
				var nrows = self.pagination.rp_options[i];
				html += '<li><a href="javascript:void(0);" data-value="'+ nrows +'">'+ nrows +'</a></li>';
			}

			html += '</ul>';
		html += '</div>';

		return html;
	},

	_initPaginator: function()
	{
		var self = this;

		if (!self.pagination.rp_options)
		{
			self.pagination.rp_options = GridCore.consts.PAGINATOR_RP_OPTIONS;
		}

		self.pagination.rp = self.pagination.rp_options[0];
		self.pagination.page = GridCore.consts.PAGINATOR_PAGE_START;
	},

	_buildComponent: function()
	{
		var self = this;
		self._validateDomSelector();

		self._initPaginator();

		self._container.append(self._getTableContainerHtml());
		self._container.append(self._getPaginatorContainerHtml());

		self.thead = $(self._theadId);
		self.tbody = $(self._tbodyId);
	},

	_getTr: function(uuid, data)
	{
		if (!this.columns)
		{
			throw 'You must define the [columns]';
		}

		var tr = '<tr id="' + uuid + '">';

		for (var i in this.columns)
		{
			if (this.columns[i].name && !this.columns[i].actionColumn)
			{
				var columnName = this.columns[i].name;
				var columnText = data[columnName] ? data[columnName] : '';
				tr += '<td>' + columnText + '</td>';
			}
			else
			{
				tr += '<td>' + this.columns[i].renderer(data) + '</td>';
			}
		}

		tr += '</tr>';

		return tr;
	},

	loadPage: function(page, query)
	{
		var inputCurrentPage = $(self._paginatorContainerId).find('.gc-page-value');

		if (page !== this.page)
		{
			this.pagination.page = page;

			inputCurrentPage.val(this.pagination.page + 1);
		}

		this.load(query);
	},

	load: function(query, url)
	{
		var self = this;

		if (!url && !this.dataUrl)
		{
			throw 'You must pass the [url] to the load method';
		}

		var endpoint = url ? url : this.dataUrl;

		var data = query ? query : {};

		data['rp'] = self.pagination.rp;
		data['page'] = self.pagination.page;
		data['order_field'] = self.order.field;
		data['order_direction'] = self.order.direction;

		$.restCore('GET', endpoint, data, function(error, response)
		{
			if (self.beforeFill)
			{
				response = self.beforeFill(response);
			}

			if (!response.rows)
			{
				throw 'Response.rows attr not defined';
			}

			self.selected = null;

			self.fill(response.rows);

			if (self.afterFill)
			{
				response = self.afterFill(response);
			}
		});
	},

	_fillHeaders: function()
	{
		if (!this.thead)
		{
			throw 'You must define the [thead] jquery option';
		}

		var trs = '<tr>';

		for (var i in this.columns)
		{
			var column = this.columns[i];
			trs += '<th><a data-name="' + column.name + '" class="gc-header-links" href="javascript:void(0);">' + column.title  + '</a></th>';
			this.headers[column.name] = column;
		}

		trs += '</tr>';

		this.thead.html(trs);
	},

	_parseData: function(data)
	{
		for (var i in data)
		{
			if (data[i] == null)
			{
				data[i] = '';
			}
		}

		return data;
	},

	fill: function(rows)
	{
		if (!this.tbody)
		{
			throw 'You must define the [tbody] jquery option';
		}

		var i = 0;
		var trs = '';

		for (var i in rows)
		{
			var uuid = 'row-' + i;

			trs += this._getTr(uuid, rows[i]);

			this.items[uuid] = this._parseData(rows[i]);
		}

		this.tbody.html(trs);

		this.bindEvents();

		if (this.afterRender)
		{
			this.afterRender();
		}

		if (this.bindActionColumn)
		{
			this.bindActionColumn();
		}
	},

	_bindRowClick: function()
	{
		var self = this;
		var trs = this._tableId + ' tbody tr';

		$(trs).off('click');
		$(trs).on('click', function()
		{
			$(trs).find('td').removeClass('gc-highlight-selected-row');
			$(this).find('td').addClass('gc-highlight-selected-row');

			var item = self.items[$(this).attr('id')];

			self.selected = item;

			if (self.onRowClick)
			{
				self.onRowClick(item, self);
			}
		});
	},

	_bindRowDoubleClick: function()
	{
		var self = this;
		var trs = this._tableId + ' tbody tr';

		$(trs).off('dblclick');
		$(trs).on('dblclick', function()
		{
			var item = self.items[$(this).attr('id')];

			self.selected = item;

			if (self.onRowDoubleClick)
			{
				self.onRowDoubleClick(item, self);
			}
		})
	},

	_bindHeaderClick: function()
	{
		var self = this;
		var ths = this._tableId + ' thead th a';

		$(ths).off('click');
		$(ths).on('click', function()
		{
			var header = self.headers[$(this).data('name')];

			self.order.field = header.name;
			self.order.direction = (self.order.direction === 'ASC') ? 'DESC' : 'ASC';

			if (self.sortByHeader)
			{
				self.load();
			}

			if (self.onHeaderClick)
			{
				self.onHeaderClick(header, self);
			}
		})
	},

	_bindPaginator: function()
	{
		var self = this;

		// Bind paginator only once
		if (!self.bindings.paginator)
		{
			var buttonPageStart = $(self._paginatorContainerId).find('.gc-page-start');
			var buttonPageNext = $(self._paginatorContainerId).find('.gc-page-next');
			var buttonPagePrev = $(self._paginatorContainerId).find('.gc-page-prev');
			var buttonPageLast = $(self._paginatorContainerId).find('.gc-page-last');
			var inputCurrentPage = $(self._paginatorContainerId).find('.gc-page-value');
			var linksRp = $(self._paginatorContainerId).find('.gc-select a');

			// Default page 1
			inputCurrentPage.val(parseInt(self.pagination.page)+1);

			buttonPageNext.off('click');
			buttonPageNext.on('click', function()
			{
				self.loadPage(self.pagination.page+1);
				console.log('self._paginatorContainerId', self._paginatorContainerId);
			});

			buttonPageStart.off('click');
			buttonPageStart.on('click', function()
			{
				self.loadPage(0);
			});

			buttonPagePrev.off('click');
			buttonPagePrev.on('click', function()
			{
				if (self.pagination.page > 0)
				{
					self.loadPage(self.pagination.page-1);
				}
			});

			linksRp.off('click');
			linksRp.on('click', function()
			{
				var selected = {
					text: $(this).text(),
					value: $(this).data('value'),
				};

				var btn = $(this).parent().parent().parent().find('button');

				btn.text(selected.text);
				btn.append('&nbsp;<span class="caret"></span>');
				btn.data('value', selected.value);

				self.pagination.rp = parseInt(selected.value);

				self.load();
			});
		}
	},

	bindEvents: function()
	{
		this._bindRowClick();
		this._bindRowDoubleClick();
		this._bindHeaderClick();
		this._bindPaginator();
	},

	getSelectedItem: function()
	{
		return this.selected;
	}
};